# londons-pulse

London's Pulse: Medical Officer of Health reports 1848-1972

## Building

```bash
# build
docker build -t moh:local .

# run
docker run --rm -it -p 5080:80 --name moh moh:local
```