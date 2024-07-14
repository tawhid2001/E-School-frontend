const getQueryParams = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};


const getCourseDetail = () => {
  const courseId = getQueryParams("id");
  const usertType = localStorage.getItem("user_type");
  // http://127.0.0.1:8000/course/${courseId}
  fetch(`https://e-school-backend.onrender.com/course/${courseId}`)
    .then((res) => res.json())
    .then((course) => {
      console.log(course);
      const courseDetail = document.getElementById("course-detail");
      const div = document.createElement("div");
      div.innerHTML = `
      <div class="card m-5 mx-auto">
      <div class="card-body">
          <h1 class="card-title">Course Name: ${course.course_name}</h1>
            <h5 class="card-text">Course Code: ${course.course_code}</h5>
            <p class="card-text">Description: ${course.description}</p>
            <p class="card-text">Teacher: <small><strong>${
              course.teacher_name
            }</strong></small></p>
            <p class="card-text">Department: ${course.department_name}</p>
            <p class="card-text">Time: <small><strong>${formatDate(
              course.created_at
            )}</strong></small></p>

            ${usertType === 'teacher' ?`
            <a class="btn btn-primary m-4" href="./add_lesson.html?course_id=${courseId}" id="add-btn">Add Lesson</a>`:""}
            </div>
            </div>
            `;
      courseDetail.appendChild(div);

      // set data into modal

      document.getElementById("edit_course_name").value = course.course_name;
      document.getElementById("edit_course_code").value = course.course_code;
      document.getElementById("editDescription").value = course.description;
    });
};

const editCourse = (event) => {
  event.preventDefault();
  const courseId = getQueryParams("id");

  const form = document.getElementById("edit-course");
  const formData = new FormData(form);
  const token = localStorage.getItem("authToken");
  console.log(token);

  const editcourseData = {
    course_name: formData.get("edit_course_name"),
    course_code: formData.get("edit_course_code"),
    description: formData.get("editDescription"),
  };

  // http://127.0.0.1:8000/course/${courseId}/
  fetch(`https://e-school-backend.onrender.com/course/${courseId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(editcourseData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      $("#editModal").modal("hide");
    });
};

const deleteCourse = () => {
  const courseId = getQueryParams("id");
  const token = localStorage.getItem("authToken");
  http://127.0.0.1:8000/course/${courseId}/
  fetch(`https://e-school-backend.onrender.com/course/${courseId}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  })
    .then((res) => (window.location.href = "./index.html"))
    .catch((err) => console.log(err));
};

const enrollStudent = () => {
  const token = localStorage.getItem("authToken");
  const studentId = localStorage.getItem("user_id");
  const courseId = getQueryParams("id");
  // console.log(studentId,courseId);
  // http://127.0.0.1:8000/enroll/enrollments/
  fetch("https://e-school-backend.onrender.com/enroll/enrollments/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      student: studentId,
      course: courseId,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to enroll in the course.");
      }
      return response.json();
    })
    .then((enrollment) => {
      console.log("Enrollment successful:", enrollment);
      localStorage.setItem(`course_enrolled_${courseId}`, true);
      window.location.href = `./course_detail.html?id=${courseId}`;
    })
    .catch((error) => {
      console.error("Error enrolling in course:", error);
    });
};

// Function to toggle visibility of buttons based on user type

const getLessons = () => {
  const courseId = getQueryParams("id");
  const userType = localStorage.getItem("user_type");
  const enrolled = localStorage.getItem(`course_enrolled_${courseId}`);
  // http://127.0.0.1:8000/course/courselessons/${courseId}
  const url = `https://e-school-backend.onrender.com/course/courselessons/${courseId}`;
  const headers = enrolled
    ? { Authorization: `Token ${localStorage.getItem("authToken")}` }
    : {};

  fetch(url, { headers })
    .then((res) => res.json())
    .then((lessons) => {
      console.log(lessons);
      const lessonContainer = document.getElementById("lessons");
      lessonContainer.innerHTML = "";
      if (!enrolled || userType === "teacher") {
        lessons.forEach((lesson) => {
          const div = document.createElement("div");
          div.className = "card m-5 mx-auto";
          div.innerHTML = `
        <div class="card-body">
              <h1 class="card-title">Lesson Title: ${lesson.title}</h1>
              <h5 class="card-text">Lesson Content: ${lesson.content}</h5>
              <p class="card-text">Time: <small><strong>${formatDate(
                lesson.created_at
              )}</strong></small></p>
              ${
                userType === "teacher"
                  ? `
                <a href="editlesson.html?lessonId=${lesson.id}&courseId=${courseId}" class="btn btn-primary m-4">Edit</a>
            <button class="btn btn-danger m-4" onclick="deleteLesson(${lesson.id})">Delete</button>
                `
                  : ""
              }
            </div>
        `;
          lessonContainer.appendChild(div);
        });
      } else {
        lessons.forEach((lesson) => {
          const completedLesson = localStorage.getItem(
            `lesson_completed_${lesson.id}`
          );
          const div = document.createElement("div");
          div.className = "card m-5 mx-auto";
          if (completedLesson === "true") {
            div.innerHTML = `
          <div class="card-body">
                    <h1 class="card-title">Lesson Title: ${lesson.title}</h1>
                    <h5 class="card-text">Lesson Content: ${lesson.content}</h5>
                    <p class="card-text">Time: <small><strong>${formatDate(
                      lesson.created_at
                    )}</strong></small></p>
                   
                      <button class="btn btn-primary mt-3" disabled>Completed</button>
                  </div>
                `;
          } else {
            div.innerHTML = `
          <div class="card-body">
                    <h1 class="card-title">Lesson Title: ${lesson.title}</h1>
                    <h5 class="card-text">Lesson Content: ${lesson.content}</h5>
                    <p class="card-text">Time: <small><strong>${formatDate(
                      lesson.created_at
                    )}</strong></small></p>
                    <form id="progressForm_${
                      lesson.id
                    }" onsubmit="submitProgress(event, ${lesson.id})">
                      <input type="hidden" name="lesson_id" value="${
                        lesson.id
                      }">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="completed" id="completed_${
                          lesson.id
                        }">
                        <label class="form-check-label" for="completed_${
                          lesson.id
                        }">
                          Completed
                        </label>
                      </div>
                      <button type="submit" class="btn btn-primary mt-3">Submit Progress</button>
                    </form>
                  </div>
                `;
          }
          lessonContainer.appendChild(div);
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching lessons:", error);
      alert("Failed to fetch lessons.");
    });
};

const submitProgress = (event, lessonId) => {
  event.preventDefault();
  const form = document.getElementById(`progressForm_${lessonId}`);
  const completed = form.querySelector(`#completed_${lessonId}`).checked;
  const token = localStorage.getItem("authToken");

  const data = {
    lesson: lessonId,
    completed: completed,
    student: localStorage.getItem("user_id"),
  };

  // http://127.0.0.1:8000/enroll/lesson-progress/
  fetch("https://e-school-backend.onrender.com/enroll/lesson-progress/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      localStorage.setItem(`lesson_completed${lessonId}`, true);
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error updating progress:", error);
      alert("Failed to update progress.");
    });
};

const fetchCompletedLessons = () => {
  const token = localStorage.getItem("authToken");
  const courseId = getQueryParams("id");
  // http://127.0.0.1:8000/enroll/courselessons/${courseId}
  fetch(`https://e-school-backend.onrender.com/enroll/courselessons/${courseId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  })
    .then((res) => res.json())
    .then((lessons) => {
      console.log(lessons);
      lessons.forEach((lesson) => {
        localStorage.setItem(`lesson_completed_${lesson.id}`, lesson.completed);
      });
    })
    .catch((error) => {
      console.error("Error Fetching", error);
    });
};

fetchCompletedLessons();

const deleteLesson = (lessonID) => {
  const courseId = getQueryParams("courseId");
  const token = localStorage.getItem("authToken");

  fetch(`https://e-school-backend.onrender.com/course/lessons/${lessonID}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  })
    .then(() => {
      alert("Lesson deleted successfully!");
      window.location.href = `course_detail.html?id=${courseId}`;
    })
    .catch((err) => {
      console.error("Error deleting lesson:", err);
      alert("Failed to delete lesson.");
    });
};

const isCourseEnrolled = (courseId) => {
  return localStorage.getItem(`course_enrolled_${courseId}`) === "true";
};
const toggleButtons = () => {
  const userType = localStorage.getItem("user_type");
  const courseId = getQueryParams("id");
  const control = document.getElementById("controls");
  const editCourseButton = document.getElementById("editcoursebtn");
  const deleteCourseButton = document.getElementById("delete-btn");
  const editLessonButton = document.getElementById("editLessonbtn");
  const deleteLessonButton = document.getElementById("delete-btn-lesson");
  const addLessonbtn = document.getElementById("add-btn");
  const enrollButton = document.getElementById("enroll-btn");

  console.log(userType);
  
  control.style.display = "none";
  if (userType === "student") {
    control.style.display = "none";
    editCourseButton.style.display = "none";
    deleteCourseButton.style.display = "none";
    enrollButton.style.display = "block";
    if (isCourseEnrolled(courseId)) {
      // Show the course details if enrolled
      document.getElementById("course-progress").style.display = "block";
      document.getElementById("enroll-btn").style.display = "none";
    } else {
      // Show the enroll button if not enrolled
      enrollButton.style.display = "block";
    }
  } else if (userType === "teacher") {
    deleteCourseButton.style.display = "block";
    editCourseButton.style.display = "block";
    enrollButton.style.display = "none";
    control.style.display = "block";
    document.getElementById("course-progress").style.display = "none";
  } else {
    editCourseButton.style.display = "none";
    deleteCourseButton.style.display = "none";
    enrollButton.style.display = "none";
  }
};

// Function to retrieve user type from localStorage
const getUserType = () => {
  return localStorage.getItem("user_type");
};
// Function to handle page load
const handlePageLoad = () => {
  const userType = getUserType();
  toggleButtons(userType);
};

const showCourseProgress = () => {
  const courseId = getQueryParams("id");
  console.log(courseId);
  const enrolled = localStorage.getItem(`course_enrolled_${courseId}`);
  console.log(enrolled);

  if (enrolled === "true") {
    fetch(`https://e-school-backend.onrender.com/enroll/course_progress/${courseId}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch course progress.");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        const progressContainer = document.getElementById("course-progress");
        
        progressContainer.innerHTML = `
            <h2>Course Progress</h2>
            <p class="h5">Course Name: <small>${data.course_name}</small></p>
            <p class="h5">Progress: <small>${data.progress}%</small></p>
          `;

          if(getUserType() === 'teacher'){
            progressContainer.style.display = 'none';
          }
          else{
            progressContainer.style.display = 'block';
          }
      })
      .catch((error) => {
        console.error("Error fetching course progress:", error);
        alert(error.message);
      });
  }
};

showCourseProgress();
getLessons();
getCourseDetail();
