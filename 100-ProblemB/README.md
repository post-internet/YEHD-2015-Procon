当日はpdfのみ与えられました.  

[Encoded_CryptographicMessage.pdf](Encoded_CryptographicMessage.pdf)

---

# Cryptographic Message

実行時間制限: 2 sec / メモリ制限: 256 MB  

## 問題文

AliceとBobは大親友です.  
二人はコンピュータセキュリティのスペシャリストであり, この分野で彼らを知らない者はいませんでした.  

ある日不幸な事件が起ります.  
有ろう事かBobが何者かによって殺害されてしまったのです.  
悲しみに暮れるAliceは犯行現場でBobの残したダイイング・メッセージを発見しました.  
また, Aliceはそのメッセージにヴィジュネル暗号が施されていることが一目でわかりました.  
AliceとBobの仲なので,鍵が何かは容易に想像がつきました.  
あなたの仕事はAliceにダイイング・メッセージと鍵を聞き, それを複合するプログラムを作成することです.  

ヴィジュネル暗号とは換字式暗号の一種で, 平文の各文字を鍵の対応する文字を用いてシフトすることで暗号化します.  
形式的には, アルファベットを\\(a=0,b=1,\ldots,z=25\\)としたときに,
\\(C_i\\)を暗号文の\\(i\\)文字目, \\(P_i\\)を平文の\\(i\\)文字目, \\(K_i\\)を鍵の\\(i\\)文字目とすると, \\(C_i\\)を求める式及び\\(P_i\\)を求める式は以下のようになります.  

\\[
\begin{eqnarray}
C_i &=& (P_i + K_i) \bmod 26 \\
P_i &=& (C_i - K_i + 26) \bmod 26
\end{eqnarray}
\\]

鍵の文字数が平文(暗号文)の文字数未満の場合は, 鍵を繰り返し用いて暗号化(複合)します.  
暗号文と鍵は共に英小文字[a-z]のみを含む文字列であるとします.  

## 入力

入力は以下の形式で標準入力から与えられます.  

\\(
M \\
K \\
\\)

- \\(1\\)行目にダイイング・メッセージ\\(M\\)が与えられます.
- \\(2\\)行目に鍵\\(K\\)が与えられます.  

### 制約

\\(
1 \leq |M|, |K| \leq 10^5 \\
\\)

\\(|M|\\)はダイイング・メッセージの文字数, \\(|K|\\)は鍵の文字数を表します.  
\\(M,K\\)には英小文字[a-z]のみが含まれます.  

## 出力

標準出力に, 複合したダイイング・メッセージを\\(1\\)行で出力してください.  
出力の末尾には改行を入れてください.  

---

### 入力例1

```
ewg
abc

```

### 出力例1

```
eve

```

どうやらEveが犯人のようです.  

---

### 入力例2

```
kesomvf
yehd

```

### 出力例2

```
mallory

```
