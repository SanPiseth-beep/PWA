document.getElementById('toggle-btn').addEventListener('click', function() {
    var textContent = document.getElementById('text-content');
    var toggleBtn = document.getElementById('toggle-btn');
  
    // Toggle the 'truncate' class to show or hide the full text
    textContent.classList.toggle('truncate');
  
    // Change button text based on the current state
    if (textContent.classList.contains('truncate')) {
      toggleBtn.textContent = 'Show More';
    } else {
      toggleBtn.textContent = 'Show Less';
    }
  });