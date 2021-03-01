function generateCacheKey({ operationName, variables, }) {
    if (variables && Object.keys(variables).length === 0) {
        return `${operationName}`;
    }
    return `${operationName}${JSON.stringify(variables)}`;
}

export { generateCacheKey };
//# sourceMappingURL=generateCacheKey.js.map
