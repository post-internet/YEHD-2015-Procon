# 1cm = 1cm

実行時間制限: 2 sec / メモリ制限: 256 MB  

## 問題文

正の整数\\(a,b\\)が与えられます.  
\\(lcm(x,y) = lcm(a,b)\\)となるような正の整数\\(x,y\\)の組は何通り存在するかを求めてください.  
ここで,\\(lcm(a,b)\\)は\\(a\\)と\\(b\\)の最小公倍数を表します.  

## 入力

入力は以下の形式で標準入力から与えられます.  

\\(
a\ b \\
\\)

- \\(1\\)行目に\\(a\\)と\\(b\\)が空白区切りで与えられます.  

### 制約

\\(
1 \leq a, b \leq 10^5 \\
\\)


## 出力

標準出力に, \\(lcm(x,y) = lcm(a,b)\\)となるような正の整数\\(x,y\\)の組の数を\\(1\\)行で出力してください.  
出力の末尾には改行を入れてください.  

---

### 入力例1

```
3 12

```

### 出力例1

```
15

```

\\(lcm(3,12) = 12\\)です.  
最小公倍数が\\(12\\)となる組み合わせは以下のようになり, \\(15\\)が答えになります.  

\\((1,12),(2,12),(3,4),(3,12),(4,3),(4,6),(4,12),(6,4),(6,12),(12,1),(12,2),(12,3),(12,4),(12,6),(12,12)\\)

---

### 入力例2

```
123 321

```

### 出力例2

```
27

```

---

### 入力例3

```
30 24

```

### 出力例3

```
63

```