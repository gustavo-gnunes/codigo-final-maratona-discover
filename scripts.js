const Modal = {
  open() {
    //Abrir modal
    // Adicionar a class active ao modal
    document //é uma classe que procura tudo que tem no html
      .querySelector('.modal-overlay') // procura a classe modal-oberlay do html
      .classList.add('active') // vai achar essa classe a cima e add uma classe chamada active

  },
  openFormCarregado(description, amount, date) {
    document.querySelector('.modal-overlay').classList.add('active')
    document.querySelector(".button.cancel").classList.add('disable')

    // qdo encontrar o / na data, ele reparte em um array de string
    let splittedDate = date.split("/")
    // a data é salva em 3 posição do array Ex: 2021-10-23 0->2021 1->10 2->23
    // pega cada posição e formata na data vista aqui no Brasil Ex: 23-10-2021
    date = `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`

    document.querySelector('input#description').value = description
    document.querySelector('input#amount').value = amount /100
    document.querySelector('input#date').value = date

  },
  close() {
    // fechar o modal
    // Remover a class active do modal
    document
      .querySelector('.modal-overlay')
      .classList.remove('active')

    document.querySelector(".button.cancel").classList.remove('disable')
  },
}

// guarda informações dentro do navegador
// -> botão direito na pagina web-> inspetion-> aplication-> Local storage
const Storage = {
  // JSON.parse-> transforma uma string em um array, ou um objeto
  // O [], serve se caso a chave: dev.finances:transaction, estiver vazia, retorna um arry vazio
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transaction")) || []
  },

  // JSON.stringfy-> transforma um array em uma string
  // dev.finances:transactions-> pode ser qq nome, esse nome eu vou pegar na função get
  // transaction-> é o array que foi declarado logo abaixo, para carregar a pagina com informações de algumas transações
  // como o array transaction eu retirei, qdo carregar a pagina não vai ter os dados, mas conforme eu for add nova transação, os dados ficam salvos no navegador
  set(transaction) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transaction))
  },
}

/*const transactions = [
  {
    id: 1,
    description: 'Luz',
    amount: -50000,
    date: '23/01/2021',
  },
  {
    id: 2,
    description: 'Website',
    amount: 50000,
    date: '23/01/2021',
  },
  {
    id: 3,
    description: 'Internet',
    amount: -20000,
    date: '23/01/2021',
  },
  {
    id: 4,
    description: 'App',
    amount: 200000,
    date: '23/01/2021',
  },
]*/

const Transaction = {
  // pega tudo da variavel transactions e joga dentro da variavel all
  // em vez de all: transaction, ele vai receber Storage.get()-> que vai pegar as transações que eu salvei no navegador
  //all: transactions,
  // não salva as transações no js, como na variavel transactions, e sim no proprio navegador
  all: Storage.get(),

  add(transaction) {
    // push-> recebe um array e o push colaca dentro do array alguma coisa, que nesse caso é transiction
    Transaction.all.push(transaction)

    App.reload()
  },

  update(index) {
    let getArray = Transaction.all.slice(index, index +1)

    Modal.openFormCarregado(getArray[0].description, getArray[0].amount, getArray[0].date)

    Transaction.remove(index)
  },

  remove(index) {
    // splice-> metodo que aplica em arrays, ele pega a posição do array
    // 1-> seria qtos elementos vai deletar, nesse caso é 1, por isso está o numero 1
    Transaction.all.splice(index, 1)

    
    App.reload()
  },

  incomes() {
    let income = 0
    // forEach-> é como se fosse um for, que seria para cada transação faça alguma coisa
    // Transaction.all-> é o array que está a cima na variavel transactions, com as transações
    // transaction que está depois do forEach-> pode ser qq nome
    // transactions.forEach(function(trasaction){...}) é a mesma coisa que
    // transactions.forEach((trasaction) => {...})-> como só tem um argumento "(trasaction) =>" pode tirar o ()
    // transactions.forEach(trasaction => {...})
    // isso chama eron function
    Transaction.all.forEach(transaction => {
      if(transaction.amount > 0) {
        income += transaction.amount
      }
    })

    return income
  },

  expenses() {
    let expense = 0

    Transaction.all.forEach(transaction => {
      if(transaction.amount < 0) {
        expense += transaction.amount
      }
    })

    return expense
  },

  total() {
    // deve ser uma + o outro, pq o expense está com o sinal de -, e na formula matemática + com -, dá -, então acaba subtraindo
    return Transaction.incomes() + Transaction.expenses();
  }
}

const DOM = {
  // encontra no html o tbody que fica dentro da table com o id data-table e joga para variavel transactionsContainer
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    // cria um tr em formato de objeto
    const tr = document.createElement('tr')
    // innerHTML-> serve para receber um html e mostrar na tela do usuário, que nesse caso seria o da function innerHTMLTransation
    // joga pra dentro do tr os td que foi criado na função innerHTMLTransation 
    tr.innerHTML = DOM.innerHTMLTransation(transaction, index)
    // vai receber o index da linha de cada transação
    tr.dataset.index = index

    // joga pra dentro do html o tr criado com os td
    DOM.transactionsContainer.appendChild(tr)
  },

  innerHTMLTransation(transaction, index) {
    // if amount > 0, o td da class vai receber income, se não recebe expense
    const CSSclass = transaction.amount > 0 ? "income" : "expense"

    const amount = Utils.formartCurrency(transaction.amount)
    
    const html = `
      <td class=description>${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
      </td>
      <td>
        <img onclick="Transaction.update(${index})" src="./assets/btnEditar.svg" alt="Alterar transação">
      </td>
    `

    return html
  },

  updateBalance() {
    // document-> vasculha todo HTML até encontrar a outra funcionalidade, que nesse caso é o getElementById
    // getElementById-> procura no HTML um determnado id
    // innerHTML-> recebe algo para mostrar na tela do usuário
    document.getElementById("incomeDisplay").innerHTML = Utils.formartCurrency(Transaction.incomes())
    document.getElementById("expenseDisplay").innerHTML = Utils.formartCurrency(Transaction.expenses())
    document.getElementById("totalDiplay").innerHTML = Utils.formartCurrency(Transaction.total())
  },

  clearTransaction() {
    // limpa tudo que foi inserido na tag tbody
    DOM.transactionsContainer.innerHTML = ""
  }
}

// função para tratar o valor da transação
const Utils = {
  formatAmount(value) {
    value = value * 100
    return Math.round(value)
  },

  formatDate(date) {
    // qdo encontrar o - na data, ele reparte em um array de string
    const splittedDate = date.split("-")
    // a data é salva em 3 posição do array Ex: 2021-10-23 0->2021 1->10 2->23
    // pega cada posição e formata na data vista aqui no Brasil Ex: 23/10/2021
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formartCurrency(value) {
    // if (value < 0) coloca sinal de negativo, se não deixa sem nada 
    const signal = Number(value) < 0 ? "-" : ""

    // g-> pega todos os caracteres e não só o primeiro
    // D-> o que não é numero
    // pega tudo que não for numero e deixa sem nada
    // remove qq caracter especial
    value = String(value).replace(/\D/g, "")

    // esta fazendo isso, pq o nuemro está vindo sem a virgula. Ex: 50000 em vez de 500,00
    value = Number(value) / 100

    // coloca o R$ em cada numero
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value
  }
}

const Form = {
  // pega o que o usuário digitou no formulário na tag input
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  // retorna um objeto com os valores
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  // validar campos
  validarFields() {
    const { description, amount, date} = Form.getValues()
    
    // trim-> limpa os espaços vazio de uma string
    if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
      throw new Error("Por favor, preencha todos os campos")
    }
  },

  // formata o valor e a data
  formatValues() {
    // pega os valores que o usuário digitou nos campos do fromulario
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)
    
    // retorna oa valores formatados
    return {
      description,
      amount,
      date
    }

  },

  // limpa os campos do formulário
  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  // passa o html para esse evento. Na tag do formulario do html, tem que colocar um onsubmit
  submit(event) {
    // não deixa fazer o comprtamento padrão, enviando para url do navegador um monte de coisa, ele não deixa enviar
    // Ex: http://127.0.0.1:5501/index.html?description=&amount=&date=#, essa é a url sem a linha de código abaixo, usando comportamento padrão
    // Ex: http://127.0.0.1:5501/index.html#, essa é a url com a linha de código abaixo
    event.preventDefault()

    try {
      Form.validarFields()
      const transaction = Form.formatValues()
      // salvar a transação
      Transaction.add(transaction)
      // apagar os dados do formulário
      Form.clearFields()
      // fechar o formulário
      Modal.close()

    } catch (error) {
      alert(error.message)
    }

    
  }
}


const App = {
  init()
  {
    // percorre em todas as transações que estão dentro da Transaction.all
    Transaction.all.forEach((transaction, index) => {
      // add as transações
      DOM.addTransaction(transaction, index)
    })

    // chama a function updateBalance de dentro da DOM
    DOM.updateBalance()

    // serve para carregar as transsações que eu fui add no navegador
    Storage.set(Transaction.all)
  },

  reload(){
    DOM.clearTransaction()
    App.init()
  }
}

// inicia a aplicação
App.init()

//Transaction.remove(0)




