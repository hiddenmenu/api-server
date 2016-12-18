##### API Response 설계에 대한 가이드 문서입니다. 
##### Status Code와 JSON Response(response body)로 정의합니다.

[API 분석 참고](https://gist.github.com/subicura/8329759)

## STATUS CODE
- 200 - ok
  - index, show, update, 그외 대부분
- 201 - create
  - create
- 204 - no content
  - remove
- 400 - bad_request
  - validation error, resource not found, 그외 각종 실패
- 401 - unauthorized
  - invalid login, login required
- 403 - forbidden
  - authentication_user!는 성공했으나 cancan, authority 등에서 권한 체크 실패
- 404 - not found
  - 요청한 자원이 존재하지 않거나 요청한 route 정보가 없을때

***

## JSON RESPONSE

**Success Default Syntax**

```javascript
{
  ... resource data is here
}
```

- resource data를 바로 리턴합니다.

**Failure Default Syntax**

```javascript
{
  "error":{
    "code":"VALIDATION_FAILED",
    "message":"title field is required"
  }
}
```

- code는 대문자로 띄어쓰기 대신 _(underscore) 사용
  - code는 추후 정리하면 좋을것 같습니다.
- message는 의미있게

***

## JSON RESPONSE EXAMPLE

**index(리스트 조회)**

- 페이징이 없을때 

status - `200`
```javascript
[
  {
    "id":1,
    "content":"content 1"
  } 
]
```

- 페이지 숫자 없이 페이징 처리를 할 경우 (infinity scroll/...)

status - `200`
```javascript
{
  "page":{
    "prev":"http://xxxx/xxxx",
    "next":"http://xxxx/xxxx"
  },
  "items":{
    "id":1,
    "content":"content 1"
  } 
}
```

- 페이지 숫자로 페이징 처리를 할 경우 (일반 게시판 형식)

status - `200`
```javascript
{
  "page":{
    "current_page":1,
    "total_count":100,
    "per_page":15
  },
  "items":{
    "id":1,
    "content":"content 1"
  } 
}
```

**detail(조회)**

status - `200`
```javascript
{
  "id":1,
  "content":"content 1"
} 
```

**create(생성)**

status - `201`
```javascript
{
  "id":1,
  "content":"content 1"
} 
```

**update(수정)**

status - `200`
```javascript
{
  "id":1,
  "content":"content 1"
} 
```

**update(삭제)**

status - `204`
```javascript
no content
```

**error(유효성 에러)**

- 일반에러

status - `400`
```javascript
{
  "error":{
    "code":"VALIDATION_FAILED",
    "message":"제목을 입력해 주세요."
  }
}
```

- 인증에러

status - `401`
```javascript
{
  "error":{
    "code":"INVALID_LOGIN",
    "message":"이메일 혹은 비밀번호가 틀립니다."
  }
}
{
  "error":{
    "code":"UNAUTHORIZED",
    "message":"로그인이 필요한 서비스입니다."
  }
}
```

- 권한에러

status - `403`
```javascript
{
  "error":{
    "code":"FORBIDDEN",
    "message":"프로젝트 접근권한이 없습니다."
  }
}
```

- 자원조회 에러

status - `404`
```javascript
{
  "error":{
    "code":"RESOURCE_NOT_FOUND",
    "message":"요청하신 자원을 찾지 못했습니다."
  }
}
```

- 라우팅 조회 에러

status - `404`
```javascript
{
  "error":{
    "code":"API_NOT_FOUND",
    "message":"요청하신 API를 찾지 못했습니다."
  }
}
```

***

## JSON RESPONSE EXAMPLE for RAILS

성공시 [active_model_serializer](https://github.com/rails-api/active_model_serializers)를 사용합니다.
실패시 기본 json render를 이용합니다.

- application_controller.rb

```ruby
private

def default_serializer_options
  {
    root: false
  }
end

def render_error(code = 'ERROR', message = '', status = :bad_request)
  render json: {
    error: {
      code: code,
      message: message
    }
  }, :status => status
end
```

**index(리스트 조회)**

- 페이징이 없을때 

status - `200`
```ruby
render json: @posts
```

- 페이지 숫자 없이 페이징 처리를 할 경우 (infinity scroll/...)

status - `200`
```ruby
render json: @posts, meta_key:'page', meta: {prev:'xx', next:'xx'}, root:'items'
```

- 페이지 숫자로 페이징 처리를 할 경우 (일반 게시판 형식)

status - `200`
```ruby
render json: @posts, meta_key:'page', meta: {current_page:1, total_count:100, per_page: 15}, root:'items'
```

**detail(조회)**

status - `200`
```ruby
render json: @post
```

**create(생성)**

status - `201`
```ruby
render json: @post, status: :created
```

**update(수정)**

status - `200`
```ruby
render json: @post
```

**update(삭제)**

status - `204`
```ruby
render nothing: true, status: :no_content
```

**error(유효성 에러)**

- 일반에러

```ruby
render_error 'VALIDATION_ERROR', '제목을 입력해주세요.'
```

- 인증에러

```ruby
render_error 'INVALID_LOGIN', '이메일 혹은 비밀번호가 틀립니다.', :unauthorized
render_error 'UNAUTHORIZED', '로그인이 필요한 서비스입니다.', :unauthorized
```

- 권한에러

```ruby
render_error 'FORBIDDEN', '프로젝트 접근권한이 없습니다.', :forbidden
```

***

## JSON RESPONSE - Client handling

header status code를 기준으로 성공 실패를 분기처리하고
에러시 특정 header status를 처리하고 에러객체가 있을 경우
에러 정보를 활용한다.

- status code == 2xx
  - success callback
- status code != 2xx
  - status code == 400 (bad requset)
    - error 객체의 에러메시지 출력
    - failure callback
  - status code == 401 (unauthorized)
    - 로그인 요청이면
      - failure callback
    - 로그인 요청이 아니면
      - error 객체의 에러메시지 출력
      - 세션 초기화
      - 로그인 페이지로 이동
  - status code == 403 (forbidden)
    - error 객체의 에러메시지 출력
    - failure callback
  - else
    - 서버 에러가 발생하였습니다
    - failure callback
