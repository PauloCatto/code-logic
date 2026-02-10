export interface Challenge {
  id: number;
  title: string;
  description: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: 'if-else' | 'ternary' | 'es6' | 'loops' | 'functions';
}

export const ADULT_CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: 'O Básico do If-Else',
    description: 'Qual será a saída do código abaixo?',
    codeSnippet: `
let status = 'error';

if (status === 'success') {
  console.log('Operação realizada!');
} else {
  console.log('Falha na operação.');
}
    `,
    options: [
      'Operação realizada!',
      'Falha na operação.',
      'undefined',
      'Erro de sintaxe'
    ],
    correctAnswer: 1,
    explanation: 'A condição `status === "success"` é falsa, pois `status` é "error". Portanto, o bloco `else` é executado.',
    topic: 'if-else'
  },
  {
    id: 2,
    title: 'Operador Ternário',
    description: 'Como podemos reescrever o código anterior usando um operador ternário?',
    codeSnippet: `
let status = 'error';
let message = status === 'success' ? 'Operação realizada!' : 'Falha na operação.';
console.log(message);
    `,
    options: [
      'Operação realizada!',
      'Falha na operação.',
      'true',
      'false'
    ],
    correctAnswer: 1,
    explanation: 'O ternário avalia a condição antes do `?`. Se verdadeira, retorna o primeiro valor; se falsa, o segundo (após o `:`).',
    topic: 'ternary'
  },
  {
    id: 3,
    title: 'Desestruturação (ES6)',
    description: 'Qual o valor de `nome` e `idade`?',
    codeSnippet: `
const usuario = { nome: 'Ana', idade: 25, cidade: 'São Paulo' };
const { nome, idade } = usuario;
console.log(nome, idade);
    `,
    options: [
      'undefined undefined',
      'Ana 25',
      '{ nome: "Ana" } { idade: 25 }',
      'Erro'
    ],
    correctAnswer: 1,
    explanation: 'A desestruturação extrai propriedades do objeto `usuario` para variáveis com o mesmo nome.',
    topic: 'es6'
  },
  {
    id: 4,
    title: 'Arrow Functions',
    description: 'Qual é o retorno da função abaixo?',
    codeSnippet: `
const soma = (a, b) => a + b;
console.log(soma(5, 3));
    `,
    options: [
      '8',
      '53',
      'undefined',
      'Erro'
    ],
    correctAnswer: 0,
    explanation: 'Arrow functions com uma única expressão retornam o valor dessa expressão implicitamente (sem necessidade de `return`).',
    topic: 'es6'
  },
  {
    id: 5,
    title: 'Template Strings',
    description: 'Qual a saída correta?',
    codeSnippet: `
const item = 'café';
const preco = 5;
console.log(\`O \${item} custa R$ \${preco},00\`);
    `,
    options: [
      'O ${item} custa R$ ${preco},00',
      'O café custa R$ 5,00',
      'O item custa R$ preco,00',
      'Erro de sintaxe'
    ],
    correctAnswer: 1,
    explanation: 'Template strings (delimitadas por crase) permitem interpolação de variáveis usando `${}`.',
    topic: 'es6'
  },
  {
    id: 6,
    title: 'Map (Arrays)',
    description: 'O que será impresso?',
    codeSnippet: `
const numeros = [1, 2, 3];
const dobrados = numeros.map(n => n * 2);
console.log(dobrados);
    `,
    options: [
      '[1, 2, 3]',
      '[2, 4, 6]',
      '[1, 2, 3, 2, 4, 6]',
      'Erro'
    ],
    correctAnswer: 1,
    explanation: 'O método `map` cria um novo array com os resultados da chamada de uma função para cada elemento do array original.',
    topic: 'es6'
  },
  {
    id: 7,
    title: 'Filter (Arrays)',
    description: 'Quantos elementos terá o array resultante?',
    codeSnippet: `
const idades = [15, 22, 18, 30, 12];
const maiores = idades.filter(idade => idade >= 18);
console.log(maiores.length);
    `,
    options: [
      '2',
      '3',
      '4',
      '5'
    ],
    correctAnswer: 1,
    explanation: 'O método `filter` cria um novo array com todos os elementos que passaram no teste (idade >= 18). Os números são 22, 18 e 30.',
    topic: 'es6'
  },
  {
    id: 8,
    title: 'Promises & Async/Await',
    description: 'Qual será a ordem de impressão?',
    codeSnippet: `
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
    `,
    options: [
      'A, B, C, D',
      'A, D, B, C',
      'A, D, C, B',
      'A, C, D, B'
    ],
    correctAnswer: 2,
    explanation: 'Síncronos (A, D) executam primeiro. Microtasks (Promise - C) têm prioridade sobre Macrotasks (setTimeout - B).',
    topic: 'es6'
  },
  {
    id: 9,
    title: 'Closures',
    description: 'O que a função `contador` imprime?',
    codeSnippet: `
function criarContador() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}
const contador = criarContador();
console.log(contador());
console.log(contador());
    `,
    options: [
      '0, 1',
      '1, 1',
      '1, 2',
      'undefined'
    ],
    correctAnswer: 2,
    explanation: 'A função interna mantém uma referência ao escopo léxico da função pai (`count`), preservando o estado entre chamadas (Closure).',
    topic: 'functions'
  },
  {
    id: 10,
    title: 'Valor vs Referência',
    description: 'Qual o valor de `obj1.a`?',
    codeSnippet: `
let obj1 = { a: 10 };
let obj2 = obj1;
obj2.a = 20;
console.log(obj1.a);
    `,
    options: [
      '10',
      '20',
      'undefined',
      'Erro'
    ],
    correctAnswer: 1,
    explanation: 'Objetos são passados por referência. `obj1` e `obj2` apontam para o mesmo endereço de memória.',
    topic: 'es6'
  },
  {
    id: 11,
    title: 'Reduce (Arrays)',
    description: 'Qual o resultado final?',
    codeSnippet: `
const nums = [1, 2, 3, 4];
const soma = nums.reduce((acc, curr) => acc + curr, 0);
console.log(soma);
     `,
    options: [
      '10',
      '24',
      '1',
      'undefined'
    ],
    correctAnswer: 0,
    explanation: 'Reduce acumula valores. 0+1=1, 1+2=3, 3+3=6, 6+4=10.',
    topic: 'es6'
  }
];
