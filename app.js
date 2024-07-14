const addCourse = (event) => {
  event.preventDefault();

  const form = document.getElementById("add-course");
  const formData = new FormData(form);
  const token = localStorage.getItem("authToken");
  console.log(token);

  const courseData = {
    course_name: formData.get("course_name"),
    course_code: formData.get("course_code"),
    description: formData.get("description"),
    slug: formData.get("course_name").toLowerCase().replace(/ /g, '-'),
    department: formData.get("department"),
  };
//   console.log(courseData);
// http://127.0.0.1:8000/course/
fetch("https://e-school-backend.onrender.com/course/",{
    method:"POST",
    headers: {
        "Content-Type":"application/json",
        Authorization: `Token ${token}`,
    },
    body: JSON.stringify(courseData),
}).then(res=>res.json())
.then(data=>{
    window.location.href = "./index.html";
})
};



const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const loadCourses = () => {
  const token = localStorage.getItem('authToken');
  
  
  fetch("https://e-school-backend.onrender.com/course/", {
    method: 'GET',
    headers: {
      "Content-Type": 'application/json',
      "Authorization": `Token ${token}`  // Include Authorization header
    }
  })
  .then((res) => res.json())
  .then((courses) => {
    console.log(courses);
    const allCourse = document.getElementById("all-courses");
    allCourse.innerHTML = '';
    if(courses.length > 0){
      courses.forEach((course) => {
        const div = document.createElement("div");
        div.classList.add("col-sm-6");
        div.innerHTML = `
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">Course Name: ${course.course_name}</h3>
              <h5 class="card-text">Course Code: ${course.course_code}</h5>
              <p class="card-text">Time: ${formatDate(course.created_at)}</p>
              <a href="./course_detail.html?id=${course.id}" class="btn btn-primary">Details</a>
            </div>
          </div>
        `;
        allCourse.appendChild(div);
      });
    }else{
      allCourse.innerHTML = '<p class="h1 p-4 m-4 text-danger">No courses to show</p>';
    }
  })
  .catch((error) => {
    console.error("Error loading courses:", error);
  });
};




const userDetails =()=>{
  const token = localStorage.getItem('authToken');
  
  // http://127.0.0.1:8000/api/auth/user/
fetch('https://e-school-backend.onrender.com/api/auth/user/', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`
    }
})
.then(response => response.json())
.then(data => {
 
  console.log(data);
    localStorage.setItem("user_type",data.user_type);
    localStorage.setItem("user_id",data.id);
    const userInfo = document.getElementById("userDetails");
    userInfo.innerHTML = '';
    const div = document.createElement("div");
    div.classList.add("col-sm-6");
    div.innerHTML = `
    <div class="card user-detail">
          <div class="card-body">
            <h3 class="card-title">Username: ${data.username}</h3>
            <h5 class="card-title">Name: ${data.first_name} ${data.last_name}</h5>
            <p class="card-text">email: ${data.email}</p>
            <p class="card-text">User Type: ${data.user_type}</p>
            <a class="btn btn-primary" href="./edit_user.html">Edit User Information</a>
          </div>
      </div>
        </div>
    `;
    userInfo.appendChild(div);
});
};


const fetchMyCourses = () => {
  const token = localStorage.getItem('authToken');
  const userType = localStorage.getItem('user_type');

  if (userType === 'teacher') {
    // http://127.0.0.1:8000/course/mycourses/
    fetch('https://e-school-backend.onrender.com/course/mycourses/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization : `Token ${token}`
      }
    })
    .then(response => response.json())
    .then(courses => {
      console.log(courses);
      const myCoursesContainer = document.getElementById('myCourses');
      
      if (courses.length > 0) {
        myCoursesContainer.innerHTML = '';
        courses.forEach(course => {
          const div = document.createElement('div');
          div.className = 'card m-5 mx-auto';
          div.innerHTML = `
            <div class="card">
              <div class="card-body">
                <h3 class="card-title">Course Name: ${course.course_name}</h3>
                <h5 class="card-text">Course Code: ${course.course_code}</h5>
                <p class="card-text">Time: ${formatDate(course.created_at)}</p>
                <a href="./course_detail.html?id=${course.id}" class="btn btn-primary">Details</a>
              </div>
            </div>
          `;
          myCoursesContainer.appendChild(div);
        });
      } else {
        // Display a message when no courses are found
        myCoursesContainer.innerHTML = '<p>You don\'t have any courses.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching courses:', error);
    });
  } else {
    console.log('User is not a teacher');
  }
};

const addLesson=(event)=>{
  event.preventDefault();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("course_id");

  const formData = {
    title : document.getElementById("lesson_title").value,
    content : document.getElementById("lesson_content").value,
    course: courseId,
  };

  const token = localStorage.getItem('authToken');
  // http://127.0.0.1:8000/course/${courseId}/lessons/
  fetch(`https://e-school-backend.onrender.com/course/${courseId}/lessons/`,{
    method:'POST',
    headers: {
      'Content-Type' : 'application/json',
      Authorization : `Token ${token}`,
    },
    body: JSON.stringify(formData),
  })
  .then((res) => res.json())
  .then((data) =>{
    console.log("Lesson added Successfully",data);
    window.location.href = `./course_detail.html?id=${courseId}`;
  });
};