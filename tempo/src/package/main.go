package main

import (
	"fmt"
	"os"
	"runtime/debug"
	"tempo/walksrc"

	"time"
)

func printBuildTime(start time.Time) {
	fmt.Printf("%v", time.Now().Sub(start))
}

func main() {
	start := time.Now()
	defer printBuildTime(start)
	debug.SetGCPercent(-1)

	walksrc.ExtractSchemaInfo(os.Args[1], os.Args[2], os.Args[3])
}
