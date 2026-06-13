## Советы по стилю написания JavaScript-кода

Хорошие практики стиля кода помогают поддерживать чистоту, читаемость и единообразие проектов. Вот несколько общих рекомендаций по написанию качественного JS-кода:

### 1. Именование переменных и функций

- **Используйте понятные имена**: Переменные и функции должны иметь осмысленные названия, отражающие их назначение (firstName, calculateTotal).

- **Старайтесь избегать сокращений**, кроме общепринятых аббревиатур (url, id, html).

- Используйте **camelCase** для именования переменных и методов (myVariable, getUserData), **PascalCase** для классов и конструкторов (MyClass, Person) и **snake_case** для констант (API_URL).

- Использование сокращений допускается только в предикатах, когда обработка идет по сценарию, не связанным с контекстом, либо, именование само создает достаточно глубокий контекст

```js
// Хорошо
const userId = 'user_1';
function getFullName(firstName, lastName) {
    return `${firstName} ${lastName}`;
}

// Плохо
let uid = 'usr1'; // Неясно, что означает

//можно, а зачем?
let trimmedNames = names.map(name => name.trim())

//мы не теряем в контексте
let trimmedNames = names.map(v => v.trim())
```

### 2. Приведение типов

Избегайте автоматического приведения типов, всегда приводите тип явно и старайтесь явно указывать тип значения:

```js
// Плохо
if (someVar == true) {} // Лучше явно проверить === true

// Хорошо
if (typeof someVar === 'string') {}

// Варианты явного приведения типов также:
(+val) || Number(val) || parseFloat(val) || parseInt(val) // в число
val + "" || String(val) || val.toString() // в строку
!!val || Bool(val) // в бинарное значение
```

### 3. Разделение логики

Разделяйте код на небольшие функции, каждая из которых решает одну конкретную задачу. Это улучшает читаемость и упрощает тестирование. Старайтесь, чтобы функция не превышала 20 строк.

```js
// Вместо сложной функции
function processData(data) {
    // ...
}

// Лучше разделить
function validateData(data) {
    // Проверяем данные
}

function transformData(validatedData) {
    // Преобразуем данные
}

function saveToStorage(transformedData) {
    // Сохраняем данные
}
```  

Если функция имеет вспомогательные операции, используемые только одной этой функцией, эти операции должны быть вынесены в отдельные функции на уровне файла, а наружу должен экспортироваться только публичный API файла.

Основной принцип

Файл должен экспортировать только те функции, которые предназначены для прямого использования извне.

Все вспомогательные функции должны:  

- находиться в том же файле  

- не экспортироваться  

- использоваться только внутренней логикой файла  

Пример: 
```javascript 

const getVariables = async () => {
    ...
}

const normalizeData = (data) => {
    ...
}

const handleValues = (values) => {
    ...
}

const createInputsDialog = (config, initialValues) => {
    
}

const inputVariablesValues = async (config) => {
   const variables = getVariables()
   const normalizedVariables = normalizeData(variables)
   const handledValues = normalizeData(normalizedVariables)

   return createInputs(handledValues)
}

module.exports = inputVariablesValues
```

В остальных случаях функции выносятся извне (пример выше)


### 4. Работа с массивами и объектами

Используйте методы высшего порядка (map, filter, reduce, find) вместо традиционных циклов for. Они делают код чище и лаконичнее:

```js
// До
const newArray = [];
for (let i = 0; i < array.length; i++) {
    if (array[i].isActive) {
        newArray.push(array[i]);
    }
}

// После
const activeItems = array.filter(item => item.isActive);
```

### 5. Обработка ошибок

Обрабатывайте возможные ошибки сразу же, используя блоки try-catch или явные проверки значений перед выполнением критичных действий, для промисов ВСЕГДА используйте втсроенный блок catch:

```js

try {
    // код, который ломается
} catch (e) {
    message.show(e.message)
}


await errorMakingFunction().then(
    //самые важные обработчики
    )
    .catch(e => message.show(e.message))
```

### 6. Never nesting

Практика подразумевающая создание блоков кода (особенно условных), которые имеют минимальную вложенность. Основной способ - описывать не условие входа, а условие выхода

```js
//не пишем
function(x) {
    if(condition1){
        y = Math.sqrt(x)
        
        if(condition2){
            return x
        }
    }
}

//пишем
function(x) {
    if (!conditon1) return;
    
    y = Math.sqrt(x)
    
    if (!condition2) return;
    
    return x;
}
```

Аналогично можно делать и с циклами используя `break` и `continue`

### 7. Функции-предикаты

Если предикат короткий, очевидный и используется один раз — не создавай переменную. Пиши inline.

```javascript
// Хорошо (inline)
if (isValid(user)) return;

if (!hasAccess(user)) throw Error();
```

```javascript
// Плохо (лишняя переменная)
const valid = isValid(user);
if (valid) return;

// Здесь valid не добавляет смысла.
// Мы просто продублировали имя функции.
```

### 8. Использование template string literal  

Старайтесь как можно чаще использовать template string literal, особенно для форматирования sql и многострочных текстов.