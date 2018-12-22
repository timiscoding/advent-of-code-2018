const fs = require("fs");
const { filename } = require("../utils");
const CPU = require("./CPU");

const cpu = new CPU();
const data = fs.readFileSync(filename).toString();
cpu.load(data);
cpu.executeProgram();
console.log("Part 1 Register contents:", cpu.getRegister());

/* Reverse engineering the assembly reveals it doing the following in pseudo code:
ip
17  b += 2
18  b = b * b
19  b = c * b
20  b = 11 * b
21  e = e + 3
22  e = c * e
23  e = e + 7
24  b = b + e (b = 909)

main program
  loop f:1-909
    loop d:1-909
      if d*f = b
        a = a + f

  where a-f corr. to registers 0-5. So to get the final result in register
  'a', we simply find all the numbers from 1-909 that are divisible by 909 and sum them.

  'e' is used to store the result of comparisons (eqri, gtrr etc) so that the program can
  relative or absolute jump.

  When register 0 is 1, there is additional setup before the main program begins.
  Instructions 27 to 35 change 'b' from 909 to 10551309.

ip
27  e = c
28  e = c * e
29  e = c + e
30  e = c * e
31  e = 14 * e
32  e = c * e
33  b = b + e (b = 10551309)
34  a = 0
35  c = 0

Lines 34 and 35 reset 'a' and 'c' and start the main program
*/

let sum = 0;
for (let i = 1; i <= 10551309; i++) {
  if (10551309 % i === 0) {
    sum += i;
  }
}
console.log("Part 2 Register 0:", sum);
