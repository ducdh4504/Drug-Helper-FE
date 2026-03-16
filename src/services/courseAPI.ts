import axiosClient from './axiosClient';

export const getCoursesList = () => {
  return axiosClient.get('/Courses');
};

export const getCourseById = (courseId: string) => {
  return axiosClient.get(`/Courses/${courseId}`);
};

export const createCourse = (courseData: {
  title: string,
  contentSummary: string,
  imgUrl: string,
  description: string,
  startDate: string,   // "2025-06-15T12:49:22.680Z"
  endDate: string,    
  ageMin: number,
  capacity: number,
  resultLevel?: number
}) => {
  return axiosClient.post('/Courses', courseData)
}

export const updateCourse = (courseId: string, courseData: {
  title: string,
  contentSummary: string,
  imgUrl: string, 
  description: string,
  startDate: string,   // "2025-06-15T12:49:22.680Z"
  endDate: string,    
  ageMin: number,
  capacity: number,
  status?: number,
  resultLevel?: number
}) => {
  return axiosClient.put(`/Courses/${courseId}`, courseData);
}

export const deleteCourse = (courseId: string) => {
  return axiosClient.delete(`/Courses/${courseId}`);
}


// Course content
export const createCourseContent = (courseId: string, contentData: {
  title: string,
  content: string
}) => {
  return axiosClient.post(`/Courses/${courseId}/contents`, contentData);
}

export const getCourseContent = (courseId: string) => {
  return axiosClient.get(`/Courses/${courseId}/contents`);
}

export const updateCourseContent = (courseContentID: string, contentData: {
  title: string,
  content: string
}) => {
  return axiosClient.put(`/Courses/contents/${courseContentID}`, contentData);
}

export const deleteCourseContent = (courseContentID: string) => {
  return axiosClient.delete(`/Courses/contents/${courseContentID}`);
}

// Course registration
export const registerCourse = (data: { userId: string, courseId: string }) => {
  return axiosClient.post(`/CourseRegistrations/register`, data);
}

export const getCourseRegistration = (userId: string, courseId: string) => {
  return axiosClient.get(`/CourseRegistrations/result`, {
    params: { userId, courseId }
  });
}

export const getUserCourseRegistrations = async (userId: string) => {
  const response = await axiosClient.get(`/CourseRegistrations/user`, {
    params: { userId }
  })
  return { data: Array.isArray(response.data) ? response.data : [] }
}