# log-parser
Log Parser for ExpressJS/Morgan Middleware

A tool for querying and parsing Morgan log file directories and outputing the results in CSV format.

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

Additional details of *some options* provide below:

### -s, --start | -e, --end

Inclusive date range of logs to query.

### -q, --query

Query in regular expression (regex) format that matches rows to be parsed.

This option must be a regex string using **single quotes** in order to avoid any character issues.

A JavaScript RegExp object is created from this option and tested against each log line. Log lines without a match are returned in results.

### -f, --format

The format of the log file(s) to parse. The default is set to the *combined* log format.

The following are the log-parser supported formats. Documentation copied directly from the [expressjs/morgan](https://github.com/expressjs/morgan) README.

There are various pre-defined formats provided:

#### combined

Standard Apache combined log output.

```
:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
```

#### common

Standard Apache common log output.

```
:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]
```

#### dev

Concise output colored by response status for development use. The `:status`
token will be colored red for server error codes, yellow for client error
codes, cyan for redirection codes, and uncolored for all other codes.

```
:method :url :status :response-time ms - :res[content-length]
```

#### short

Shorter than default, also including response time.

```
:remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
```

#### tiny

The minimal output.

```
:method :url :status :res[content-length] - :response-time ms
```

### -d, --directory

Directory of log files. Log files are found using a regular expression match on filename. The regular expression is located in the config.default.json file.

Note: The filename regular expression can be overridden by creating a config.local.json file.

### -t, --transform

File path of an exported transform function. This function is called during the transform process with a log line object argument that is passed by reference.

The transform function can be used to make changes to parsed log lines prior to outputting them.

### -o, --output

File path to write all parsing output.

Currently only CSV format is supported for output files.