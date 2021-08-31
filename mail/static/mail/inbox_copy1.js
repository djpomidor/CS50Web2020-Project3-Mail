document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
//  document.querySelector('#submit').addEventListener('click', () => load_mailbox('sent'));


  // By default, load the inbox
  load_mailbox('inbox');


});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  //Send email
  document.querySelector('form').onsubmit = function() {
      const recipients = document.querySelector('#compose-recipients').value;
      const subject = document.querySelector('#compose-subject').value;
      const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
  })
  .then(response => response.json())
  .then(result => {
    // Print result

});
    return load_mailbox('sent');
};
};

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Show the emails
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    //console.log(emails);
    // create table of emails
    const table = document.createElement('table');
    table.className = 'table table-hover';
    table.id = 'emails-list';
    document.querySelector('#emails-view').append(table);
      const thead = document.createElement('thead');
      thead.id = 'thead';

      const tbody = document.createElement('tbody');
      tbody.id = 'tbody'
      document.querySelector('#emails-list').append(thead);
      document.querySelector('#emails-list').append(tbody);
      document.getElementById('thead').innerHTML = "<tr><th scope=\"col\">From</th><th scope=\"col\">Subject</th><th scope=\"col\">Date</th></tr>"

    var index = 0;
    emails.forEach(function(){
      const table_row = document.createElement('tr');
      table_row.id = emails[index].id;
      table_row.innerHTML = '<th scope=\"row\">' + emails[index].sender + '</th> ' + '<td>' + emails[index].subject + '</td>' + '<td>' + emails[index].timestamp + '</td>';
      if (emails[index].read) {
          table_row.style.backgroundColor = 'lightgrey';
      }
      if (mailbox != 'sent') {
              const but_archive = document.createElement('button');
              but_archive.className = 'btn btn-sm btn-outline-primary';
              if (mailbox === 'archive'){
                but_archive.innerHTML = 'Unarchive';
                but_archive.addEventListener('click', () => {

                  fetch('/emails/' + table_row.id, {
                    method: 'PUT',
                    body: JSON.stringify({
                      archived: false
                    })
              });
              load_mailbox('inbox');
            });

            }
                else {
                  but_archive.innerHTML = 'Archive';
                  but_archive.addEventListener('click', () => {
                  fetch('/emails/' + table_row.id, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: true
                    })
                  })
                  load_mailbox('archive');
              });
            }
            console.log('The button has been clicked!');
            console.log(mailbox);
            table_row.append(but_archive);
          }

        //}

      index ++;
      table_row.addEventListener('click', function() {

        //Show the email
        fetch('/emails/'+ table_row.id)
        .then(response => response.json())
        .then(email => {
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'none';
          document.querySelector('#email-view').style.display = 'block';
          document.querySelector('#email-view').innerHTML = '<b>From: </b>'+ email.sender + '<br>' + '<b>To: </b>' + email.recipients + '<br>' + '<b>Subject: </b>' + email.subject + '<br>' + '<b>Timestamp: </b>' + email.timestamp + '<br>';
          const but_reply = document.createElement('button');
              but_reply.className = 'btn btn-sm btn-outline-primary'
              but_reply.type = "button";
              but_reply.innerHTML = 'Reply';
          const email_body = document.createElement('div');
          email_body.innerHTML = email.body;

          document.querySelector('#email-view').append(but_reply);
          document.querySelector('#email-view').append(document.createElement('hr'));
          document.querySelector('#email-view').append(email_body);
          //Set email as Read
          fetch('/emails/' + table_row.id, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })

          //console.log(email);
        })
          console.log('This element has been clicked!')
      });
      document.querySelector('#tbody').append(table_row);
});
});
}
