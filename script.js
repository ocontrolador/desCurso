const cursoAlura = 'https://cursos.alura.com.br';
const cursos = [];
let filtro = [];
let cursosConcluidos;
const buscar = document.querySelector('input');
let pagina = 1;

//if (window.location.href.indexOf("alura.com.br")) console.log('Alura');

buscarConcluidos();
buscarCursos(pagina);

let largura = document.documentElement.clientWidth;
if (largura < 300 ) window.open("#");


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

function textoCarregado() {
    if (filtro.length == cursos.length)
        carregar.innerText = `Total de ${cursos.length} Cursos`;
    else carregar.innerText = `Encontrado ${filtro.length} de ${cursos.length} Cursos`;
}

// link = cursos[0].href.substring(cursos[0].href.indexOf('course') -1)

/* 
"link": "/course/redesenho-logo",
"title": "Redesenho de logo: a expressão gráfica do rebranding",
"categoryName": "UX & Design",
"icon": "https://www.alura.com.br/assets/api/cursos/redesenho-logo.svg",
"removedAt": "2022-12-05",
"kindDisplayName": "Curso",
"formattedDate": "05/12/2022"
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