/* Define an application
do(define(x, 10),
   if(>(x, 5),
      print("large"),
      print("small"))); */

/* Represents >(x, 5)
{
  type: "apply",
  operator: {type: "word", name: ">"},
  args: [
    {type: "word", name: "x"},
    {type: "value", value: 5}
  ]
}*/

/* Takes a string as an input. Returns an object containing the data strructure for the expression
 * at the start of the string along with the part of the string left after parsing. When parsing
 * subexpressions, this function is called again yielding the argument expression and remainder text.
 * This text may contain more arguments or be the closing parenthesis that ends the arguments list. */
function parseExpression(program) {
  program = skipSpace(program);
  let match, expr;
  // Supports three atomic elements: words, numbers, and quoted strings
  if ((match = /^"([^"]*)"/.exec(program))) {
    expr = { type: "value", value: match[1] };
  } else if ((match = /^\d+\b/.exec(program))) {
    expr = { type: "value", value: Number(match[0]) };
  } else if ((match = /^[^\s(),#"]+/.exec(program))) {
    expr = { type: "word", name: match[0] };
  } else {
    // Syntax error for invalid expression
    throw new SyntaxError("Unexpected syntax: " + program);
  }

  // Cut off the part that was matched from program string along with object for expression
  return parseApply(expr, program.slice(match[0].length));
}

// Egg like JS allows any amount of whitespace between elements. Repeatedly skips whitespace.
function skipSpace(string) {
  let first = string.search(/\S/);
  if (first == -1) return "";
  return string.slice(first);
}

// Parses a parenthesized list of arguments
function parseApply(expr, program) {
  program = skipSpace(program);
  if (program[0] != "(") {
    // Not an application
    return { expr: expr, rest: program };
  }

  // Create a syntax tree for the application
  program = skipSpace(program.slice(1));
  expr = { type: "apply", operator: expr, args: [] };
  while (program[0] != ")") {
    // Recursive call to parseExpression for each argument
    let arg = parseExpression(program);
    expr.args.push(arg.expr);
    program = skipSpace(arg.rest);
    if (program[0] == ",") {
      program = skipSpace(program.slice(1));
    } else if (program[0] != ")") {
      throw new SyntaxError("Expected ',' or ')'");
    }
  }
  return parseApply(expr, program.slice(1));
}

/* Wrap in a convenient parse function that verifies it has reached the end of the input
 * string after parsing the expression. Gives us the program's data structure */
function parse(program) {
  let { expr, rest } = parseExpression(program);
  if (skipSpace(rest).length > 0) {
    throw new SyntaxError("Unexpected text after program");
  }
  return expr;
}

console.log(parse("+(a, 10)"));
// → {type: "apply",
//    operator: {type: "word", name: "+"},
//    args: [{type: "word", name: "a"},
//           {type: "value", value: 10}]}

// Evaluator runs a syntax tree using a scope to evaluate the expression and return the value produced
const specialForms = Object.create(null);

function evaluate(expr, scope) {
  if (expr.type == "value") {
    // Literal value type
    return expr.value;
  } else if (expr.type == "word") {
    if (expr.name in scope) {
      // Variable reference type in scope
      return scope[expr.name];
    } else {
      throw new ReferenceError(`Undefined binding: ${expr.name}`);
    }
  } else if (expr.type == "apply") {
    let { operator, args } = expr;
    if (operator.type == "word" && operator.name in specialForms) {
      // Handle special forms like if
      return specialForms[operator.name](expr.args, scope);
    } else {
      // Recursive structure resembles the parser structure, mirroring the language itself
      let op = evaluate(operator, scope);
      if (typeof op == "function") {
        return op(...args.map((arg) => evaluate(arg, scope)));
      } else {
        throw new TypeError("Applying a non-function.");
      }
    }
  }
}

// Defines special syntax for if. Should evaluate only either its second or third argument.
specialForms.if = (args, scope) => {
  // If is similar to the ternary ? : operator
  if (args.length != 3) {
    throw new SyntaxError("Wrong number of args to if");
  } else if (evaluate(args[0], scope) !== false) {
    // Only treats the value false as false, not zero or the empty string
    return evaluate(args[1], scope);
  } else {
    return evaluate(args[2], scope);
  }
};

specialForms.while = (args, scope) => {
  if (args.length != 2) {
    throw new SyntaxError("Wrong number of args to while");
  }
  while (evaluate(args[0], scope) !== false) {
    evaluate(args[1], scope);
  }

  // Since undefined does not exist in Egg, we return false for lack of a meaningful result
  return false;
};

// Do executes all its arguments from top to bottom. Its value is produced by the last argument
specialForms.do = (args, scope) => {
  let value = false;
  for (let arg of args) {
    value = evaluate(arg, scope);
  }
  return value;
};

// Create bindings and give them values with define. Returns the value assigned like = operator.
specialForms.define = (args, scope) => {
  // Expects two arguments with word in first position and value in second
  if (args.length != 2 || args[0].type != "word") {
    throw new SyntaxError("Incorrect use of define");
  }
  let value = evaluate(args[1], scope);
  scope[args[0].name] = value;
  return value;
};

/* The scope accepted by evaluate is an object with properties whose names correspond to binding
 * names and whose values correspond to their values. Define an object to represent global scope.
 * We need access to boolean values to use the if construct above. No special syntax needed. */
const topScope = Object.create(null);
topScope.true = true;
topScope.false = false;
// Simple expression negates a boolean value
let prog = parse(`if(true, false, true)`);
console.log(evaluate(prog, topScope));
// → false

// Supply basic arithemetic and comparison operators
// Function snthesizes a bunch of operator functions in a loop rather than defining them individually
for (let op of ["+", "-", "*", "/", "==", "<", ">"]) {
  topScope[op] = Function("a, b", `return a ${op} b;`);
}

// Convenient to have a way to output values by wrapping console.log in a function called print
topScope.print = (value) => {
  console.log(value);
  return value;
};

// Conveniently parses a program and runs in in a fresh scope
function run(program) {
  return evaluate(parse(program), Object.create(topScope));
}

// Object prototype chains represent nested scopes so the program can add bindings to its local scope
// Computes the sum of the numbers 1 to 10
run(`
    do(define(total, 0),
       define(count, 1),
       while(<(count, 11),
             do(define(total, +(total, count)),
                define(count, +(count, 1)))),
       print(total))
    `);
// → 55

// Function definition treats the last argument as the functions body. Uses all arguments before that as the names of parameters.
specialForms.fun = (args, scope) => {
  if (!args.length) {
    throw new SyntaxError("Functions need a body");
  }
  let body = args[args.length - 1];
  let params = args.slice(0, args.length - 1).map((expr) => {
    if (expr.type != "word") {
      throw new SyntaxError("Parameter names must be words");
    }
    return expr.name;
  });

  return function (...args) {
    if (args.length != params.length) {
      throw new TypeError("Wrong number of arguments");
    }
    let localScope = Object.create(scope);
    for (let i = 0; i < args.length; i++) {
      localScope[params[i]] = args[i];
    }
    return evaluate(body, localScope);
  };
};

// Functions get their own local scope. The function produced by fun creates this local scope and adds the bindings.
// Then evaluate the function body in this scope and return the results.
run(`
    do(define(plusOne, fun(a, +(a, 1))),
       print(plusOne(10)))
    `);
// → 11

run(`
    do(define(pow, fun(base, exp,
         if(==(exp, 0),
            1,
            *(base, pow(base, -(exp, 1)))))),
       print(pow(2, 10)))
    `);
// → 1024

/* Define a specific notation for a parser
expr = number | string | name | application
number = digit+
name = letter+
string = '"' (! '"')* '"'
application = expr '(' (expr (',' expr)*)? ')' */

// Add support for arrays to Egg by adding three functions

// Constructs an array containing the arguments
topScope.array = (...values) => values;
// Length gets an array's length
topScope.length = (array) => array.length;
// Element fetches the n-th element of an array
topScope.element = (array, i) => array[i];

run(`
do(define(sum, fun(array,
     do(define(i, 0),
        define(sum, 0),
        while(<(i, length(array)),
          do(define(sum, +(sum, element(array, i))),
             define(i, +(i, 1)))),
        sum))),
   print(sum(array(1, 2, 3))))
`);
// → 6

/* Closure: We have defined fun to allow functions in Egg to reference
 * the surrounding scope. This allows function bodies that were visible
 * when the function was defined just like JS. Function f returns a
 * function that adds its argument to f's argument. Meaning that it needs
 * access to the local scope inside f to be able to use it.
 * Explain which mechanism causes this inside of the fun definition.
 *
 * The local scope is created as a deep copy of the current scope.
 * This loads all bindings into the new scope and passes it to the
 * new function while keeping the old scope unchanged. Special forms
 * are also passed the local scope in which they are evaluated.
 * The prototype of the local scope will be the scope in which
 * the function is created. This makes it possible to access bindings
 * in that scope fromt he function. Compiling closure would take more work. */
run(`
    do(define(f, fun(a, fun(b, +(a, b)))),
       print(f(4)(5)))
    `);
// → 9

/* Comments: Define comments in Egg using a hash sign (#). Simply change skipSpace
 * to skip comments as if they are whitespace so all points where skipSpace is called
 * skips comments */
function skipSpace(string) {
  // Define a regular expression that replaces whitespace or comments and all characters after them
  let skippable = string.match(/^(\s|#.*)*/);
  return string.slice(skippable[0].length);
}

console.log(parse("# hello\nx"));
// → {type: "word", name: "x"}

console.log(parse("a # one\n   # two\n()"));
// → {type: "apply",
//    operator: {type: "word", name: "a"},
//    args: []}

/* Fixing scope: The only way to assign a binding a value is define. This construct
 * acts as a way to both define new bindings and update existing ones. This ambiguity
 * causes a problem. When you try to give a nonlocal binding a value, you will define
 * a local one with the same name.
 * Add a special form set similar to define which gives a binding a new value, updating
 * the binding in an outer scope if necessary. If the binding is not defined throw
 * a ReferenceError. Consider the Object.getPrototypeOf() method. Remember you can
 * use Object.hasOwn to find out if a given object has a property. */
specialForms.set = (args, env) => {
  // Expects two arguments with word in first position and value in second
  if (args.length != 2 || args[0].type != "word") {
    throw new SyntaxError("Set requires two arguments: a word and value");
  }
  let varName = args[0].name;
  let value = evaluate(args[1], scope);
  // Loop through one scope at a time using Object.getPrototypeof to go to the next outer scope
  for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
    // Use Object.hasOwn to check if the binding is in scope
    if (Object.hasOwn(scope, args[0])) {
      // Set the binding to the result of evaluating the second argument and return that value
      scope[varName] = value;
      return value;
    }
  }
  // The binding is not in scope so throw a ReferenceError
  throw new ReferenceError(`Undefined binding: ${varName}`);
};

run(`
  do(define(x, 4),
     define(setx, fun(val, set(x, val))),
     setx(50),
     print(x))
  `);
// → 50
run(`set(quux, true)`);
// → Some kind of ReferenceError
