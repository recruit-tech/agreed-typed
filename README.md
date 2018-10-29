# agreed-typed

- agreed api type definitions (types.ts)
- agreed.ts to swagger generator

## install
```shell
$ npm install -g agreed-typed
```

## usage
```shell
$ agreed-typed --help
Usage: agreed-typed [subcommand] [options]
Subcommands:
  gen-swagger                        Generate swagger file.
Options:
  --help                             Shows the usage and exits.
  --version                          Shows version number and exits.
Examples:
  agreed-typed gen-swagger --path ./agreed.ts
```

### gen-swagger
```shell
$ agreed-typed gen-swagger --help
Usage: agreed-typed gen-swagger [options]
  Options:
    --path                             Agreed file path (required)
    --title                            swagger title
    --description                      swagger description
    --version                          document version
    --depth                            aggregate depth (default = 2)
    --dry-run                          dry-run mode (outputs on stdout)
    --output                           output filename (default schema.json)
    --help                             show help
  Examples:
    agreed-typed gen-swagger --path ./agreed.ts --output schema.json
```

## License
This project is licensed under the Apache License 2.0 License - see the [LICENSE](LICENSE) file for details