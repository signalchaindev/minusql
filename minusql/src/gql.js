function gql(strings, ...pieces) {
  return String.raw(
    { raw: strings[0].replace(/[\s,]+/g, " ").trim() },
    ...pieces
  );
}

export default gql;
