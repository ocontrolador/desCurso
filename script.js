const cursoAlura = 'https://cursos.alura.com.br';
const cursos = [];
let filtro = [];
let cursosConcluidos;
const buscar = document.querySelector('input');
let pagina = 1;

buscarConcluidos();
buscarCursos(pagina);

let largura = document.documentElement.clientWidth;
if (largura < 300 ) window.open("#");

  /**
   * Fetches the Alura user page and parses the page for the ".course-card__course-link" elements
   * which represent the courses the user has already completed.
   * @returns {Promise<void>}
   */
function buscarConcluidos() 
{
    let url = `https://cursos.alura.com.br/user/`;
    fetch(url)
      .then(res => res.text())
      .then(data => {
        let pagina = document.createElement('div');
        pagina.innerHTML = `${data}`; 
        return pagina;
      })
      .then( pagina => { 
        cursosConcluidos = pagina.querySelectorAll('.course-card__course-link')
      })
      .catch((error) => {
        console.error(error);
      });      
  }

  /**
   * Fetches the Alura "loadMore" page with the given page number and parses it for the courses.
   * @param {number} pagina - The page number to fetch.
   * @returns {Promise<void>}
   */
function buscarCursos(pagina) 
{
  let url = `https://cursos.alura.com.br/conteudos-descontinuados/cursos/loadMore?page=${pagina}`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      cursos.push(...data.content);
      if (!data.last) {
        //montaTabela(data.content)
        pagina++;
        buscarCursos(pagina);
      } else {
        buscar.disabled = false;
        filtro.push(...cursos);
        montaTabela(cursos)
        textoCarregado();
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
        //console.log(pagina);
    });
}

const tabela = document.querySelector('table')
const linha = document.createElement("tr");
const cabecalho = '<th id="concluidos">✅</th> \
    <th id="ordemData">Data</th> \
    <th id="ordemNome">Nome</th> \
    <th id="ordemCategoria">Categoria</th>';
linha.innerHTML = cabecalho;
tabela.appendChild(linha);

/**
 * Populates the HTML table with course data.
 * 
 * @param {Array} dados - An array of course objects, each containing course details.
 * 
 * Each course object is expected to have the following properties:
 * - formattedDate: The date the course was added, formatted as a string.
 * - link: A string containing the relative URL to the course page.
 * - title: The title of the course.
 * - categoryName: The category of the course.
 * 
 * The function creates a new table row for each course, displaying whether the course 
 * is completed (marked with a check), the formatted date, a link to the course, and the 
 * category name.
 */
function montaTabela(dados) {
    dados.forEach( (dado) => {
        let row = tabela.insertRow();
        let cell0 = row.insertCell(0);
        let cell1 = row.insertCell(1);
        let cell2 = row.insertCell(2);
        let cell3 = row.insertCell(3);
        let concluido = ( [...cursosConcluidos].filter(c => c.href.indexOf(dado.link) > 0).length > 0);
        cell0.innerHTML = (concluido)? '✔' :'';
        cell1.innerHTML = `${dado.formattedDate}`;
        cell2.innerHTML = `<a href='${cursoAlura + dado.link}' target='_blank'>${dado.title}</a>`;
        cell3.innerHTML = `${dado.categoryName}`;
    })    
}

ordemData.addEventListener('click', () => ordenaTabela(filtro,"formattedDate"));
ordemNome.addEventListener('click', () => ordenaTabela(filtro,"title"));
ordemCategoria.addEventListener('click', () => ordenaTabela(filtro,"categoryName"));

/**
 * Sorts the given array of course data by the specified column and updates the HTML table.
 * 
 * @param {Array} dados - An array of course objects to be sorted and displayed.
 * @param {string} coluna - The property name to sort the data by.
 * 
 * The function sorts the data using the `dynamicSort` function, clears the existing table rows,
 * and repopulates the table with the sorted data.
 */
function ordenaTabela(dados,coluna) {
    if (coluna != '') dados.sort(dynamicSort(coluna));
    let linhas = document.querySelectorAll("tr").length
    for (let i = 1; i < linhas; i++) tabela.deleteRow(1);
    montaTabela(dados);    
}

buscar.addEventListener('keyup', buscaNome);
buscar.addEventListener('change', buscaNome);
buscar.addEventListener('search', buscaNome);

let timer, texto, delay = 1000;
/**
 * Handles the input event on the search box, filtering the course table based on the search text.
 * 
 * If the search text is the same as the previous search, the function does nothing.
 * Otherwise, it clears the previous timer and sets a new one to filter the courses array after the specified delay.
 * The filtered courses are stored in the filtro array and the table is updated with the sorted and filtered data.
 * 
 * @param {Event} event - The input event from the search box.
 */
function buscaNome(event) {
    if (texto == event.target.value) return
    texto = event.target.value;
    clearTimeout(timer);
    timer = setTimeout(function() {
        filtro = cursos.filter( linha => linha.title.toLowerCase().indexOf(texto.toLowerCase()) != -1);
        textoCarregado();
        ordenaTabela(filtro,'');
    }, delay );
}

/**
 * Updates the "carregar" element with a message indicating the total number of courses or the number of filtered courses.
 * 
 * If the length of the filtro array is equal to the length of the cursos array, the message is "Total de X Cursos".
 * Otherwise, the message is "Encontrado X de Y Cursos".
 */
function textoCarregado() {
    if (filtro.length == cursos.length)
        carregar.innerText = `Total de ${cursos.length} Cursos`;
    else carregar.innerText = `Encontrado ${filtro.length} de ${cursos.length} Cursos`;
}

/**
 * Creates a function that compares two objects by the given property name.
 * 
 * The comparison is done in ascending order by default, but if the property name starts with a hyphen,
 * the comparison is done in descending order instead.
 * 
 * The comparison function is suitable for use with the Array.prototype.sort() method.
 * 
 * @param {string} property - The property name to compare by.
 * @returns {function} - A comparison function that returns a negative value if a is less than b, a positive value if a is greater than b, or 0 if a is equal to b.
 */
function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

/**
 * Creates a function that compares two objects by multiple properties.
 * 
 * The comparison is done in ascending order by default, but if a property name starts with a hyphen,
 * the comparison is done in descending order instead.
 * 
 * The comparison function is suitable for use with the Array.prototype.sort() method.
 * 
 * @param {...string} properties - One or more property names to compare by.
 * @returns {function} - A comparison function that returns a negative value if obj1 is less than obj2, a positive value if obj1 is greater than obj2, or 0 if obj1 is equal to obj2.
 */
function dynamicSortMultiple() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    var props = arguments;
    return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;
        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
        while(result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    }
}
