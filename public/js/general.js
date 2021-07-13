

const form = document.querySelector('#addToDoForm');

//ADD NEW TO DO TO THE LIST
form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const input = form.toDoInput.value
    
    try {
        const res = await fetch('/addToDos',  {
            method: 'POST',
            body: JSON.stringify({input}),
            headers: { 'Content-Type': 'application/json'}
        })
        location.reload()
    }
    catch (err) {
        console.log(err)
    }
})

//GET ALL TODOS FROM THE LIST
async function getTodos() {
    try {
        const ul = document.querySelector('.toDos')
        let newElement = '';
        const res = await fetch('/getToDos')
        const json = await res.json()
        console.log(json)
        if(json.hasOwnProperty('error')) {
            newElement = `<li class="toDoItem">
            <span class="text">
                No data, please add a todo
            </span>
        </li>`
        }else {
            json.forEach(todos => {
                console.log(todos.todo)
                newElement += `<li class="toDoItem">
                                <span class="text">
                                    ${todos.todo}
                                </span>
                                <button class="done">Done</button>
                            </li>`
            });
        }
        ul.innerHTML = newElement;


    }
    catch(err) {
        console.log(err)
    }
}
getTodos()