# Personal Diary API Documentation

REST API for authentication, diary posts, comments, saved posts, and post statistics.

Base URL: `http://localhost:8000/api`  
Swagger UI: `http://localhost:8000/api-docs`

## Authentication Model

The backend uses a two-token flow:

| Token | Lifetime | Storage | Usage |
| --- | --- | --- | --- |
| Access token | 15 minutes | Client memory | Send as `Authorization: Bearer <access_token>` |
| Refresh token | 7 days | `httpOnly` cookie named `refreshToken` | Used by `POST /auth/refresh-token` |

Login is rate-limited to 5 attempts per IP per minute.

## Common Error Format

```json
{
  "message": "Error description",
  "code": "OPTIONAL_ERROR_CODE"
}
```

Common statuses: `400` validation error, `401` unauthenticated or expired token, `403` forbidden, `404` not found, `429` rate limited, `500` server error.

## Auth Endpoints

### Register

`POST /auth/register`

Request:

```json
{
  "name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

Validation:

| Field | Rule |
| --- | --- |
| `name` | Required, 2-100 characters |
| `email` | Required, valid email, unique |
| `password` | Required, 8-128 characters |

Response `201`:

```json
{
  "message": "Register successful. Please log in to continue.",
  "user": {
    "id": "user_id",
    "name": "Nguyen Van A",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Login

`POST /auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

Response `200`:

```json
{
  "message": "Login successful",
  "access_token": "jwt_access_token",
  "user": {
    "id": "user_id",
    "name": "Nguyen Van A",
    "email": "user@example.com",
    "role": "user"
  }
}
```

Side effect: sets `refreshToken` as an `httpOnly` cookie.

### Refresh Token

`POST /auth/refresh-token`

The preferred request uses only the `refreshToken` cookie:

```json
{}
```

Response `200`:

```json
{
  "message": "Token refreshed successfully",
  "access_token": "new_jwt_access_token"
}
```

### Logout

`POST /auth/logout`

Headers:

```http
Authorization: Bearer <access_token>
```

Response `200`:

```json
{
  "message": "Logout successful"
}
```

## Post Endpoints

### Create Post

`POST /posts`

Headers:

```http
Authorization: Bearer <access_token>
```

Request:

```json
{
  "title": "My first diary",
  "content": "Today was a good day.",
  "visibility": "PUBLIC",
  "isAnonymous": false,
  "status": "DRAFT"
}
```

Validation:

| Field | Rule |
| --- | --- |
| `title` | Required, 1-200 characters |
| `content` | Required, 1-5000 characters |
| `visibility` | Optional, `PUBLIC` or `PRIVATE`, default `PUBLIC` |
| `isAnonymous` | Optional boolean, default `false` |
| `status` | Optional, `DRAFT` or `PUBLISHED`, default `DRAFT` |

Response `201`: created post object.

### Get Posts

`GET /posts?page=1&limit=10&status=PUBLISHED`

Response `200`:

```json
{
  "posts": [],
  "pagination": {
    "current": 1,
    "limit": 10,
    "total": 0,
    "pages": 0
  }
}
```

### Get Public Posts

`GET /posts/public?page=1&limit=10`

Returns posts where `status` is `PUBLISHED` and `visibility` is `PUBLIC`.

### Get Post By ID

`GET /posts/:id`

Response `200`: post object.

### Get Posts By User

`GET /posts/user/:userId?page=1&limit=10`

Response `200`: paginated post list.

### Update Post

`PUT /posts/:id`

Headers:

```http
Authorization: Bearer <access_token>
```

Request fields are optional:

```json
{
  "title": "Updated title",
  "content": "Updated content",
  "visibility": "PRIVATE",
  "isAnonymous": true,
  "status": "DRAFT"
}
```

Only the owner or an admin can update a post.

### Publish Or Toggle Visibility

`PATCH /posts/:id`

Headers:

```http
Authorization: Bearer <access_token>
```

Request can be empty to publish drafts or toggle visibility:

```json
{}
```

Optional explicit update:

```json
{
  "status": "PUBLISHED",
  "visibility": "PUBLIC"
}
```

Response `200`: updated post object.

### Delete Post

`DELETE /posts/:id`

Headers:

```http
Authorization: Bearer <access_token>
```

Response `200`:

```json
{
  "message": "Post deleted successfully"
}
```

### Save And Unsave Post

`POST /posts/:id/save`  
`DELETE /posts/:id/save`

Both endpoints require authentication.

### Trash

`PATCH /posts/:id/trash`

Moves a post to trash with `isDeleted: true`.

`GET /posts/deleted`

Returns deleted posts for the current user.

## Comment Endpoints

### Create Comment

`POST /comments`

Headers:

```http
Authorization: Bearer <access_token>
```

Request:

```json
{
  "postId": "post_id",
  "content": "Nice post",
  "isAnonymous": false
}
```

### List Comments For A Post

`GET /comments/post/:postId?page=1&limit=10`

Response `200`: paginated comments.

### Update Comment

`PUT /comments/:id`

Request:

```json
{
  "content": "Updated comment"
}
```

### Delete Comment

`DELETE /comments/:id`

Only the owner or an admin can delete a comment.

## User Endpoints

### Current Profile

`GET /users`

Requires `Authorization: Bearer <access_token>`.

### Update Profile

`PUT /users`

Request:

```json
{
  "name": "New name",
  "avatar": "https://example.com/avatar.png"
}
```

### Change Password

`PUT /users/password`

Request:

```json
{
  "oldPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

### Activity Stats

`GET /users/stats/activity`

Returns likes received, comments received, and private post count for the current user.

### Admin Users

`GET /users/admin/users`  
`DELETE /users/:id`

Requires admin role.

### Public User

`GET /users/:id`

Returns public user data.

## Stats Endpoints

### Post Stats

`GET /stats/:postId`

Response:

```json
{
  "id": "stats_id",
  "postId": "post_id",
  "views": 10,
  "likes": 2,
  "comments": 1,
  "score": 0
}
```

### Like And Unlike

`POST /stats/:postId/like`  
`POST /stats/:postId/unlike`

Both endpoints require authentication.

### Top And Trending

`GET /stats/top?limit=10`  
`GET /stats/trending?limit=10`

## Database Indexes

Indexes are configured for frequently queried fields:

| Model | Indexed fields |
| --- | --- |
| User | `email`, `role` |
| Post | `userId`, `status`, `visibility`, `isDeleted`, `savedBy` |
| PostStats | `postId`, `score` |
| Comment | `postId`, `userId` |

## Local Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:8000/api-docs` for Swagger UI.
