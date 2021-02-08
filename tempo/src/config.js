import os from 'os'
import path from 'path'

export const binName = 'tempo'
export const binBuildDir = path.join(process.cwd(), '.bin')
export const packageDir = path.join(process.cwd(), 'src', 'package')
export const exeName = `${binName}.exe`
export const moduleBinDir = path.join(process.cwd(), 'node_modules', 'tempo', '.bin')
export const moduleBuildDir = path.join(process.cwd(), 'src', 'node_modules')
export const modulePackageDir = path.join(process.cwd(), 'node_modules', 'tempo', 'src', 'package')
export const moduleTempDirPath = path.join(process.cwd(), 'node_modules', 'tempo', 'temp')

// Mapping from Node's `process.arch` to Golang's `$GOARCH`
const ARCH_MAPPING = {
  ia32: '386',
  x64: 'amd64',
  arm: 'arm',
}

// Mapping between Node's `process.platform` to Golang's
const PLATFORM_MAPPING = {
  darwin: 'darwin',
  linux: 'linux',
  win32: 'windows',
  freebsd: 'freebsd',
}

export const goos = PLATFORM_MAPPING[os.platform()]
export const goarch = ARCH_MAPPING[os.arch()]
export const subDir = `${goos}-${goarch}`
