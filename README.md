# log-parser
Log Parser for ExpressJS/Morgan Middleware

The following at the log-parser supported log formats. Documentation copied directly from the [expressjs/morgan](https://github.com/expressjs/morgan) README.

## Predefined Formats

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

### dev

Concise output colored by response status for development use. The `:status`
token will be colored red for server error codes, yellow for client error
codes, cyan for redirection codes, and uncolored for all other codes.

```
:method :url :status :response-time ms - :res[content-length]
```

### short

Shorter than default, also including response time.

```
:remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
```

### tiny

The minimal output.

```
:method :url :status :res[content-length] - :response-time ms
```