export default function hola(_, args) {
  let greeting = args.greeting

  if (args.greeting === 'Hello') {
    greeting = 'Hola'
  }

  return greeting
}
