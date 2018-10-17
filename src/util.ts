export function showHelp(exitcode, help) {
  process.stdout.write(help);
  process.exit(exitcode);
}
