# Blogging Website

Website quản lý, đọc và viết blog cho môn học Cơ sở dữ liệu (2122II_INT2211_4).

Thành viên nhóm:
- Huỳnh Tiến Dũng - 21020007
- Phạm An Đức Vinh - 21020097
- Vũ Quốc Tuấn - 21020033

## Mục lục

- [Blogging website](#blogging-website)

    - [Mục lục](#mục-lục)
    - [Tính năng](#tính-năng)
    - [Cơ sở dữ liệu](#cơ-sở-dữ-liệu)

## Tính năng

- **User**: 

    - Viết bài viết mới.
    - Đọc các bài viết đã được đăng.
    - Tìm kiếm bài viết theo thể loại và tiêu đề.
    - Viết bình luận cho một bài viết có sẵn.
    - Chỉnh sửa bài viết của chính mình.
    - Xóa bài viết của chính mình.
    - Xem hồ sơ của người dùng khác và các bài viết của họ.

- **Admin**: 
Ngoài những tính năng của **User**, **Admin** còn có thể:

    - Chỉnh sửa bài viết bất kỳ của tất cả người dùng.
    - Xóa bài viết bất kỳ của tất cả người dùng.
    - Khóa tài khoản của một người dùng.
    - Mở khóa tài khoản của một người dùng.

## Cơ sở dữ liệu

![Blogging-website-database](https://user-images.githubusercontent.com/29995756/168264404-5dfef95c-6a05-4760-bd0f-e6e44dc1d28d.png)

**Các bảng dữ liệu**:

- **`user`**: Lưu dữ liệu về tài khoản của người dùng. Gồm các trường `id`, `userName`, `email`, `passwordHash`, `registeredAt`, `lastLogin`, `profile`, `isBan` (tài khoản bị khóa hay không), `isAdmin` (tài khoản admin hay không0).

- **`post`**: Lưu dữ liệu về các bài viết đã được viết. Gồm các trường `id`, `authorId` (`id` của tài khoản viết bài viết), `title`, `titleURL`, `isPublic`, `createdAt`, `updatedAt`, `publishedAt`, `content`.

- **`post_comment`**: Lưu dữ liệu về các bình luận của những bài viết. Gồm các trường `id`, `postId`, `parentId`, `userId`, `createdAt`, `publishedAt`, `content`.

- **`category`**: Lưu dữ liệu về các thể loại của những bài viết. Gồm các trường `id`, `title`, `titleURL`, `content`.

- **`post_category`**: Lưu quan hệ bài viết và thể loại tương ứng. Gồm các trường `postId`, `categoryId`.

