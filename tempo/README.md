# Rollup Plugin Tempo

[WIP] TODO

## Test

If you run this the temp dir gets wacky.

```bash
# Adjust for your OS

cd src/package

# win32 && win64
go build && ./tempo.exe C:\\Projects\\signalchain\\code\\packages\\tempo-suite-esbuild\\plugin\\api src

#################################
# This works but not very dynamic
#################################
cd src/package

# Build
env GOOS=windows GOARCH=amd64 go build -o C:\\Projects\\signalchain\\code\\packages\\tempo-suite-esbuild\\plugin\\tempo\\.bin\\windows-amd64\\tempo.exe

# Run
C:\\Projects\\signalchain\\code\\packages\\tempo-suite-esbuild\\plugin\\tempo\\.bin\\windows-amd64\\tempo.exe C:\\Projects\\signalchain\\code\\packages\\tempo-suite-esbuild\\plugin\\api src any

# Both
env GOOS=windows GOARCH=amd64 go build -o C:\\Projects\\signalchain\\code\\packages\\tempo-suite-esbuild\\plugin\\tempo\\.bin\\windows-amd64\\tempo.exe && C:\\Projects\\signalchain\\code\\packages\\tempo-suite-esbuild\\plugin\\tempo\\.bin\\windows-amd64\\tempo.exe C:\\Projects\\signalchain\\code\\packages\\tempo-suite-esbuild\\plugin\\api src any
```
