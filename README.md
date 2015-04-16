# parlog
Log Parser for ExpressJS/Morgan Middleware

A tool for querying and parsing Morgan log file directories and outputting results in CSV format.

**CAUTION:**

This package does NOT have automated tests. While the package has served its intended purpose it should be considered
an Alpha product until testing has been added. Hopefully tests will be added shortly.

## Requirements

- NodeJS
- NPM

See `./package.json`

## Installation

    $ npm install parlog

## Usage

    $ ./bin/parlog [options]

This will output a CSV file of the parsed log file(s) to the working directory.

## Options

```
$ ./bin/parlog --help

  Usage: parlog [options]

  Log Parser for ExpressJS/Morgan Middleware

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -d, --debug                 debug mode
    -s, --start [MM/DD/YYYY]    start date for log match
    -e, --end [MM/DD/YYYY]      end date for log match
    -q, --query [regex]         query regular expression match
    -f, --format [format]       format of logs
    -i, --directory [path]      directory of log files
    -t, --transform [filepath]  filepath of transform function
    -o, --output [filepath]     filepath of output
```

Additional details of *some options* provided below:

### -s, --start | -e, --end

Inclusive date range of logs to query.

### -q, --query

Query in regular expression (regex) format that matches rows to be parsed.

This option must be a regex string using **single quotes** in order to avoid any character issues.

A JavaScript RegExp object is created from this option and tested against each log line. Log lines without a match are returned in results.

### -f, --format

The format of the log file(s) to parse. The default is set to the *combined* log format.

The following are the parlog supported formats. Documentation copied directly from the [expressjs/morgan](https://github.com/expressjs/morgan) README.

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

Example of the expected transform file format can be found in the `./src/transform.js` file.

```js
module.exports = function(logLine) {
  // todo put logLine.data transformation code here
};
```

#### logLine

An object that is accessible within the transform function. It is passed by reference.

Important properties:

```js
logLine.data // contains the log line params that are in output results
```

```js
logLine.logOut // boolean that if false does NOT include log line to output results
```

### -o, --output

File path to write all parsing output.

Currently only CSV format is supported for output files.

## Configuration

A default configuration is provided with parlog: `./config.default.json`.

Config params can be overwritten using a local config file. To create the local config:

```
$ cp ./config.default.json ./config.local.json
```

Make configuration changes to the `./config.local.json` file. 

## Examples

A few examples of running parlog.

### Default

This will parse all log files in the default directory `./log`.

```
$ ./bin/parlog
```

### Start Date

This will parse all logs that took place at or after 04/11/1970 at 0000.

```
$ ./bin/parlog --start "04/11/1970"
```

### Date Range

This will parse all logs that took place at or between 04/11/1970 at 0000 to 04/12/1970 0000.

```
$ ./bin/parlog --start "04/11/1970" --end "04/12/1970"
```

### Query with Start Date

This will parse all logs that took place at or after 04/11/1970 at 0000 and contain the word *houston* and *problem*.

```
$ ./bin/parlog --start "04/11/1970" --query '^(?=.*houston)(?=.*problem).*$'
```

### Debug Mode

This will run parser in debug mode which outputs more runtime details.

```
$ ./bin/parlog --debug
```

## License

MIT