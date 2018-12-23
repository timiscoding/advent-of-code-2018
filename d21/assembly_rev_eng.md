# Activation System

Reversing the assembly into a more human readable format. Registers 0-5 are labelled a-f.
The activationSpy function in d21.js was derived from this.

```
ip
0     f = 123
1     f = f & 456   <--\
2     f = f === 72     |
3,4   if f !== 72    --/
      else goto next line
5     f = 0
6     e = f | 65536     <---------------------\
7     f = 13284195                            |
8     d = e & 255       <-----------------\   |
9     f = f + d                           |   |
10    f = f & 16777215                    |   |
11    f = f * 65899                       |   |
12    f = f & 16777215                    |   |
13    d = 256 > else                      |   |
14-16 if 256 > e        --------------\   |   |
      else goto next line             |   |   |
17    d = 0                           |   |   |
18    c = d + 1         <-----\       |   |   |
19    c = c * 256             |       |   |   |
20    c = c > e               |       |   |   |
21-23 if c > e          ------+---\   |   |   |
      else goto next line     |   |   |   |   |
24    d = d + 1               |   |   |   |   |
25    b = 17            ------/   |   |   |   |
26    e = d             <---------/   |   |   |
27    b = 7             --------------+---/   |
28    d = a === f       <-------------/       |
29    if a !== f        ----------------------/
```
