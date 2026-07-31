 
 Here's a summary of the Docker multi-stage builds documentation:

## Multi-Stage Builds in Docker

### Core Concept
Multi-stage builds let you use **multiple `FROM` statements** in a single Dockerfile. Each `FROM` starts a new build stage with its own base image. You can then **selectively copy artifacts** from one stage to another, leaving behind build tools and intermediate files you don't need in the final image.

### Key Benefits
- **Smaller final images** — only runtime artifacts are kept; compilers, SDKs, and build dependencies are excluded
- **Single Dockerfile** — no need for separate build scripts
- **Easier to maintain** — keeps build logic and production image definition in one place

### Basic Example
```dockerfile
# syntax=docker/dockerfile:1
FROM golang:1.25 AS build
WORKDIR /src
COPY . .
RUN go build -o /bin/hello ./main.go

FROM scratch
COPY --from=build /bin/hello /bin/hello
CMD ["/bin/hello"]
```

### Naming Stages
Use `AS <name>` to label stages, then reference them by name instead of index:
```dockerfile
FROM golang:1.25 AS build
...
COPY --from=build /bin/hello /bin/hello
```

### Targeting Specific Stages
Build only up to a certain stage with `--target`:
```console
$ docker build --target build -t hello .
```
Useful for:
- Debugging a specific stage
- Separate `debug` vs `production` stages
- `testing` stage with mock data vs `production` with real data

### Copying from External Images
You can copy from any image, not just prior stages:
```dockerfile
COPY --from=nginx:latest /etc/nginx/nginx.conf /nginx.conf
```

### Reusing Previous Stages
A stage can extend another stage:
```dockerfile
FROM alpine:latest AS builder
RUN apk --no-cache add build-base

FROM builder AS build1
COPY source1.cpp source.cpp
RUN g++ -o /binary source.cpp

FROM builder AS build2
COPY source2.cpp source.cpp
RUN g++ -o /binary source.cpp
```

### BuildKit vs Legacy Builder
| | BuildKit (default) | Legacy Builder |
|---|---|---|
| Stage execution | Only builds stages the target **depends on** | Processes **all stages** leading up to the target, even unrelated ones |
| Performance | More efficient | May waste time on unnecessary stages |

**Example:** If `stage2` depends only on `base`, BuildKit skips `stage1` entirely; the legacy builder still runs it.

---

**Source:** [Docker Docs — Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
