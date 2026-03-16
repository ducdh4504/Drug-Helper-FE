import axiosClient from './axiosClient';

// Lấy danh sách tất cả blog
export const getBlogsList = () => {
  return axiosClient.get('/Blogs');
};

// Lấy blog theo ID
export const getBlogById = (blogId: string) => {
  return axiosClient.get(`/Blogs/${blogId}`);
};

// Tìm kiếm blog theo chuỗi tìm kiếm
export const searchBlogs = (searchString: string) => {
  return axiosClient.get('/Blogs/search', {
    params: { q: searchString }
  });
};

// Tạo mới blog
export const createBlog = (blogData: {
  userId: string,
  title: string | null,
  imgUrl: string | null,
  content: string | null,
  publishDate: string | null,
  status: string,
  resultLevel?: string
}) => {
  return axiosClient.post('/Blogs', blogData);
};

// Cập nhật blog
export const updateBlog = (blogData: {
  blogID: string,
  title: string | null,
  imgUrl: string | null,
  content: string | null,
  publishDate: string | null,
  status: string,
  resultLevel?: string
}) => {
  return axiosClient.put('/Blogs', blogData);
};

// Xóa blog theo ID
export const deleteBlog = (blogId: string) => {
  return axiosClient.delete(`/Blogs/${blogId}`);
};