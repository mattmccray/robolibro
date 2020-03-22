# RoboLibro
> Tools for creating books with markdown


Requires
- [Node.js](https://nodejs.org/)
- [Pandoc](https://pandoc.org/)


## Installation

```bash
$ npm install -g github:mattmccray/robolibro
```

## Usage

Create a .docx file that is formatted to be easily imported into [Vellum](https://vellum.pub/).

```bash
$ robolibro build path/to/book.yaml
```

YAML definition example.

```yaml
title: My Book
subtitle: (Optional)
author: Me
output: manuscript.docx
create_titlepage: false
cleanup: true
input:
  - manuscript/*.md
```



## Nested definition

```bash
$ robolibro build path/to/book.yaml --target beta
```

YAML definition example.

```yaml
title: My Book
author: Me
output: manuscript.docx
create_titlepage: false
cleanup: true
input:
  - manuscript/*.md

# Nested target inherits all parent config properties
beta: 
  output: manuscript-beta.docx
  create_titlepage: true
  input:
    - manuscript/*.md
    - extra/beta-readers.md
```

## Init

Create a YAML file with default values for you to customize for your book.

```bash
$ robolibro init path/to/new/book.yaml
```
