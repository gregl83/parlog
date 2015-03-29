# log-parser
Log Parser for ExpressJS/Morgan Middleware

A tool for querying and parsing Morgan log file directories and outputing the results in CSV.

## Installation

    $ npm install log-parser

## Usage

    $ ./bin/log-parser

## Options

```
$ ./bin/log-parser --help

  Usage: log-parser [options]

  Log Parser for ExpressJS/Morgan Middleware

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -d, --debug                 debug mode
    -s, --start [MM/DD/YYYY]    start date for log match
    -e, --end [MM/DD/YYYY]      end date for log match
    -q, --query [regex]         query regular expression match
    -f, --format [format]       format of logs
    -d, --directory [path]      directory of log files
    -t, --transform [filepath]  filepath of transform function
    -o, --output [filepath]     filepath of output
```

## Predefined Formats

The following are the log-parser supported formats. Documentation copied directly from the [expressjs/morgan](https://github.com/expressjs/morgan) README.

There are various pre-defined formats provided:

### combined

Standard Apache combined log output.

```
:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
```

### common

Standard Apache common log output.

```
:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]
```

### dev - not released

Concise output colored by response status for development use. The `:status`
token will be colored red for server error codes, yellow for client error
codes, cyan for redirection codes, and uncolored for all other codes.

```
:method :url :status :response-time ms - :res[content-length]
```

### short - not released

Shorter than default, also including response time.

```
:remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
```

### tiny - not released

The minimal output.

```
:method :url :status :res[content-length] - :response-time ms
```