// the jquery free version of the javascript file
let my_modal = document.getElementById("myModal");
let modal_button = document.getElementById("modal-button");
let modal_body = document.getElementsByClassName("modal-body");
let close_modal = document.getElementById("closeModal");

modal_button.addEventListener('click', fetch_courses);
close_modal.addEventListener('click', () => {my_modal.style.display = 'none'});

function fetch_courses() {
    fetch("/api/courses")
    .then(response => response.json())
    .then(response => response.data.courses)
        .then(courses => {
            my_modal.style.display = 'block';
            modal_body[0].innerHTML = '';
            courses.forEach((course) => {
                let course_div = document.createElement('DIV');
                course_div.innerHTML = `<div><span class="course-title">${course.title}</span>
 <button id="${course._id}" class="${course.joined ? "joined-button" : "join-button"}">${course.joined ? "Joined" : "Join"}</button>
 <div class="course-description">${course.description}</div></div>`;
                modal_body[0].appendChild(course_div);
                let course_button = document.getElementById(course._id);
                addJoinButtonListener(course_button);
            });
        })
        .catch((error) => console.log('some error in fetching', error.message));
}

function addJoinButtonListener (element) {
    let courseId = element.getAttribute('id');
    if(element) {
            element.addEventListener('click', () => {
        fetch(`/api/courses/${courseId}/join`)
            .then(response => response.json())
            .then((response) => {
                if (response.data && response.data.success) {
                                    element.innerText = "Joined";
                                    element.classList.add("joined-button");
                                    element.classList.remove("join-button");
                } else {
                    element.innerText = "Try again";
                }
            });
            });
    } else {
    }
}


