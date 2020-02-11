# login_basekit

## Overview

Simple **base kit with login feature** for Node.js + Express + EJS + Cloudant, and Swagger API document.


## REST APIs

- POST /platformer : 最初の特権ユーザーを作成する

  - 送信データ : { id: 'user_id', password: 'password' }

  - 成功時の取得データ : { status: true, user: user }

- POST /login : ログイン

  - 送信データ : { id: 'user_id', password: 'password' }

  - 取得データ : { status: true, token: 'トークン' }

- POST /logout : ログアウト

  - 送信ヘッダ : x-access-token=ログイン時に取得したトークン

  - 成功時の取得データ : { status: true }

- GET /users : ユーザー一覧取得

  - 送信ヘッダ : x-access-token=ログイン時に取得したトークン

  - 成功時の取得データ : { status: true, users: [ { id: 'user_id', ... }, .. ] }

- GET /user/:id : ユーザー取得

  - 送信ヘッダ : x-access-token=ログイン時に取得したトークン

  - 送信データ : id=対象ユーザーID

  - 成功時の取得データ : { status: true, user: { id: 'user_id', .. } }

- DELETE /user/:id : ユーザー削除

  - 送信ヘッダ : x-access-token=ログイン時に取得したトークン

  - 送信データ : id=対象ユーザーID

  - 成功時の取得データ : { status: true }

- POST /user

  - 送信ヘッダ : x-access-token=ログイン時に取得したトークン

  - 送信データ : { id: 'user_id', password: 'password', ... }

  - 成功時の取得データ : { status: true, user: user }


## Copyright

2020 [K.Kimura @ Juge.Me](https://github.com/dotnsf) all rights reserved.
