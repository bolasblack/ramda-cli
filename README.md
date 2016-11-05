# ramda-cli

Usage:

    ramda [-h] [-p] <javascript>

Options:

    -h, --help     output this message
    -p, --plain    use `#toString` instead of `JSON.stringify` to print result

Examples:

    echo '[{"a":1, "b": 2}, {"b": 3}]' | ramda "map(compose(num => String(num), prop('b')))"
    # => ["2","3"]

    echo '[{"a":1, "b": 2}, {"b": 3}]' | ramda "map(compose(num => String(num), prop('b')))(data).join(' ')" -p
    # => 2 3

    echo '[{"a":1, "b": 2}, {"b": 3}]' | ramda "data.reduce((memo, elem) => memo + elem.b, 0)"
    # => 5
