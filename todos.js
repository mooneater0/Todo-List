var $ = function(sel) {
  return document.querySelector(sel);
};
var $All = function(sel) {
  return document.querySelectorAll(sel);
};
var guid = 0;
var CL_COMPLETED = 'completed';
var CL_SELECTED = 'selected';
var CL_EDITING = 'editing';

function update() {
  var items = $All('.todo-list li');
  var filter = $('.filters li a.selected').innerHTML;
  var leftNum = 0;
  var item, i, display;

  for (i = 0; i < items.length; ++i) {
    item = items[i];
    if (!item.classList.contains(CL_COMPLETED)) 
    {
      leftNum++;
    }
    else item.querySelector(".toggle").checked=true;

    // filters
    display = 'none';
    if (filter == 'All' 
        || (filter == 'Active' && !item.classList.contains(CL_COMPLETED)) 
        || (filter == 'Completed' && item.classList.contains(CL_COMPLETED))
       ) {
      display = 'block';
    }
    item.style.display = display;
  }

  var completedNum = items.length - leftNum;
  var count = $('.todo-count');
  count.innerHTML = (leftNum || 'No') + (leftNum > 1 ? ' items' : ' item') + ' left';

  var clearCompleted = $('.clear-completed');
  clearCompleted.style.visibility = completedNum > 0 ? 'visible' : 'hidden';

  var toggleAll = $('.toggle-all');
  toggleAll.style.visibility = items.length > 0 ? 'visible' : 'hidden';
  toggleAll.checked = items.length == completedNum;
}

function addTodo(message) {
  var todoList = $('.todo-list');

  var item = document.createElement('li');
  var id = 'item' + guid++;
  item.setAttribute('id', id);
  item.innerHTML = [
    '<div class="view">',
    '  <input class="toggle" type="checkbox">',
    '  <label class="todo-label">' + message + '</label>',
    '  <button class="up"></button>',
    '  <button class="destroy"></button>',
    '</div>'
  ].join('');
  localStorage.setItem(id,item.innerHTML);

  var label = item.querySelector('.todo-label');
  label.addEventListener('dblclick', function() {
    item.classList.add(CL_EDITING);

    var edit = document.createElement('input');
    var finished = false;
    edit.setAttribute('type', 'text');
    edit.setAttribute('class', 'edit');
    edit.setAttribute('value', label.innerHTML);

    function finish() {
      if (finished) return;
      finished = true;
      item.removeChild(edit);
      item.classList.remove(CL_EDITING);
    }

    edit.addEventListener('blur', function() {
      finish();
    });

    edit.addEventListener('keyup', function(ev) {
      if (ev.keyCode == 27) { // Esc
        finish();
      } else if (ev.keyCode == 13) {
        label.innerHTML = this.value;
        finish();
      }
    });

    item.appendChild(edit);
    edit.focus();
  }, false);

  item.querySelector('.toggle').addEventListener('change', function() {
    updateTodo(id, this.checked);
  });

  item.querySelector('.destroy').addEventListener('click', function() {
    removeTodo(id);
  });

  item.querySelector('.up').addEventListener('click', function() {
    console.log(item);
    upTodo(id);
  });


  todoList.insertBefore(item, todoList.firstChild);
  update();
}

function upTodo(itemId) {
  var upItem=document.getElementById(itemId);
  var complete=upItem.classList.contains(CL_COMPLETED)?1:0;
  var text=upItem.querySelector('.todo-label').innerHTML;
  console.log(text);
  var items = $All('.todo-list li');
  var item,index;
  for(var i=0;i<items.length;++i) {
    if(items[i]==upItem){
      index=i;
      break;
    }
  }
  for(var i=index;i>0;--i){
    items[i].querySelector('.todo-label').innerHTML=items[i-1].querySelector('.todo-label').innerHTML;console.log(items[i].classList);console.log(items[i-1].classList);
    if(items[i-1].classList.contains(CL_COMPLETED)) items[i].classList.add(CL_COMPLETED);
    else items[i].classList.remove(CL_COMPLETED);
    console.log(items[i].classList);console.log(items[i-1].classList);
  }
  items[0].querySelector('.todo-label').innerHTML=text;
  if(complete)  items[0].classList.add(CL_COMPLETED);
  else items[0].classList.remove(CL_COMPLETED);
}

function updateTodo(itemId, completed) {
  var item = $('#' + itemId);
  if (completed) item.classList.add(CL_COMPLETED);
  else item.classList.remove(CL_COMPLETED);
  update();
}

function removeTodo(itemId) {
  var todoList = $('.todo-list');
  var item = $('#' + itemId);
  todoList.removeChild(item);
  update();
}

function clearCompletedTodoList() {
  var todoList = $('.todo-list');
  var items = todoList.querySelectorAll('li');
  for (var i = items.length - 1; i >= 0; --i) {
    var item = items[i];
    if (item.classList.contains(CL_COMPLETED)) {
      todoList.removeChild(item);
    }
  }
  update();
}

function toggleAllTodoList() {
  var items = $All('.todo-list li');
  var toggleAll = $('.toggle-all');
  var checked = toggleAll.checked;
  for (var i = 0; i < items.length; ++i) {
    var item = items[i];
    var toggle = item.querySelector('.toggle');
    if (toggle.checked != checked) {
      toggle.checked = checked;
      if (checked) item.classList.add(CL_COMPLETED);
      else item.classList.remove(CL_COMPLETED);
    }
  }
  update();
}

window.onload = function init() {
  var newTodo = $('.new-todo'); // todo
  newTodo.addEventListener('keyup', function(ev) {
    // Enter
    if (ev.keyCode != 13) return;

    var message = newTodo.value;
    if (message == '') {
      console.warn('message is empty');
      return;
    }

    addTodo(message);
    newTodo.value = '';
  });

  var clearCompleted = $('.clear-completed');
  clearCompleted.addEventListener('click', function() {
    clearCompletedTodoList();
  });

  var toggleAll = $('.toggle-all');
  toggleAll.addEventListener('change', function() {
    toggleAllTodoList();
  });

  var filters = $All('.filters li a');
  for (var i = 0; i < filters.length; ++i) {
    (function(filter) {
      filter.addEventListener('click', function() {
        for (var j = 0; j < filters.length; ++j) {
          filters[j].classList.remove(CL_SELECTED);
        }
        filter.classList.add(CL_SELECTED);
        update();
      });
    })(filters[i])
  }

  var count=localStorage.getItem("count");
  for(var i=count-1;i>=0;i--)
  {
    var item=JSON.parse(localStorage.getItem(i));
    addTodo(item['label']);
    if(item['status']=='y') document.getElementById("item"+(guid-1)).classList.add(CL_COMPLETED);
  }
  update();
}


window.onbeforeunload=function(){
  let todos=$All('.todo-list li');
  var count=0;
  for(var i=0;i<todos.length;i++)
  {
    var item={"status":todos[i].classList.contains(CL_COMPLETED)?'y':'n',"label":todos[i].querySelector('.todo-label').innerHTML};
    localStorage.setItem(count,JSON.stringify(item));
    count++;
  }
  localStorage.setItem("count",count);
};
