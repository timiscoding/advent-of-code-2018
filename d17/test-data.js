module.exports.L = `
x=10, y=13..23
y=23, x=10..30
`;

module.exports.mirrorL = `
x=30, y=13..23
y=23, x=10..30
`;

module.exports.U = `
x=10, y=13..23
x=30, y=13..23
y=23, x=10..30
`;

module.exports.Uwall = `
x=10, y=13..23
x=30, y=13..23
y=23, x=10..30
x=20, y=12..18
`;

module.exports.sample = `
x=10, y=2..7
y=7, x=10..16
x=16, y=3..7
x=13, y=2..4
x=21, y=1..2
x=13, y=10..13
x=19, y=10..13
y=13, x=13..19
`;

// streams that divide and join
module.exports.UinU = `
x=13, y=3..5
x=17, y=3..5
y=5, x=13..17
x=11, y=10..12
x=19, y=10..12
y=12, x=11..19
`;

// streams that divide and join but bottom cup right side taller
module.exports.UinU2 = `
x=13, y=3..5
x=17, y=3..5
y=5, x=13..17
x=10, y=10..12
x=20, y=9..12
y=12, x=10..20
`;

// streams that divide and join but bottom cup left side taller
module.exports.UinU3 = `
x=13, y=3..5
x=17, y=3..5
y=5, x=13..17
x=10, y=9..12
x=20, y=10..12
y=12, x=10..20
`;

module.exports.flat = `
y=5, x=13..16
`;

module.exports.flats = `
y=5, x=13..16
y=8, x=10..13
y=8, x=15..17
`;

module.exports.flats2 = `
y=5, x=13..16
y=8, x=10..12
y=8, x=16..17
`;

module.exports.flats3 = `
y=5, x=13..16
y=8, x=10..12
y=8, x=16..17
y=12, x=10..17
`;
