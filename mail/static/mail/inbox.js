document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector("#compose-form").onsubmit = (event) => {
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
        console.log(result);
        if (result.message){
        alert (result.message);
      }
      else {
        alert(result.error);
        return;
      }
    load_mailbox('sent');
});
event.preventDefault();
};

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
    // create table of emails
      const table = document.createElement('table');
      table.className = 'table';
      table.id = 'emails-list';
      document.querySelector('#emails-view').append(table);
      const thead = document.createElement('thead');
      thead.id = 'thead';
      const tbody = document.createElement('tbody');
      tbody.id = 'tbody'
      document.querySelector('#emails-list').append(thead);
      document.querySelector('#emails-list').append(tbody);
      document.getElementById('thead').innerHTML = "<tr><th scope=\"col\">From</th><th scope=\"col\">Subject</th><th scope=\"col\">Date</th></tr>"

    let index = 0;
    emails.forEach(function(){
      const table_row = document.createElement('tr');
      table_row.id = emails[index].id;
      table_row.innerHTML = '<th scope=\"row\">' + emails[index].sender + '</th> ' + '<td>' + emails[index].subject + '</td>' + '<td>' + emails[index].timestamp + '</td>';
      if (emails[index].read == 1) {
          table_row.style.backgroundColor = '#e9ecef';
      }
      else {
          table_row.style.backgroundColor = 'white';
      }

      index ++;
      table_row.addEventListener('click', function() {
        //Set email as Read
        fetch('/emails/' + table_row.id, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })

        fetch('/emails/'+ table_row.id)
        .then(response => response.json())
        .then(email => {
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'none';
          document.querySelector('#email-view').style.display = 'block';

          //const box_name = document.createElement('h1');
          //box_name.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
          //document.querySelector('#email-view').append(box_name);
          document.querySelector('#email-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>` +  '<b>From: </b>'+ email.sender + '<br>' + '<b>To: </b>' + email.recipients + '<br>' + '<b>Subject: </b>' + email.subject + '<br>' + '<b>Timestamp: </b>' + email.timestamp + '<br>';


          const but_reply = document.createElement('button');
              //but_reply.type = "button";
              but_reply.innerHTML = 'Reply';
              but_reply.className = 'btn btn-sm btn-outline-primary'
              but_reply.addEventListener('click', () => {
                  // Show compose view and hide other views
                  document.querySelector('#emails-view').style.display = 'none';
                  document.querySelector('#email-view').style.display = 'none';
                  document.querySelector('#compose-view').style.display = 'block';

                  document.querySelector('#compose-recipients').value = email.sender;
                  document.querySelector('#compose-subject').value = 'Re: '+ email.subject;
                  document.querySelector('#compose-body').value = 'On '+ email.timestamp + ' ' + email.sender + ' wrote:' + ' ' + '\n' + email.body;
              })

          const but_archive = document.createElement('button');
              but_archive.className = 'btn btn-sm btn-outline-primary';
              but_archive.style.marginLeft = '4px';
              if (email.archived){
                but_archive.innerHTML = 'Unarchive';
                but_archive.addEventListener('click', () => {
                  fetch('/emails/' + table_row.id, {
                    method: 'PUT',
                    body: JSON.stringify({
                      archived: false
                    })
              })
              .then(result => {
                load_mailbox('inbox');
                });
            });
            }

            else {
              but_archive.innerHTML = 'Archive';
              but_archive.style.marginLeft = '4px';
              but_archive.addEventListener('click', () => {
              fetch('/emails/' + table_row.id, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                })
              })
              .then(result => {
                load_mailbox('inbox');
                });
          });
        }

          const email_body = document.createElement('div');
          email_body.innerHTML = email.body;
          document.querySelector('#email-view').append(document.createElement('hr'));
          document.querySelector('#email-view').append(but_reply);
          if (mailbox != 'sent') {
              document.querySelector('#email-view').append(but_archive);
            }
          document.querySelector('#email-view').append(document.createElement('hr'));
          document.querySelector('#email-view').append(email_body);
        })
      });
      document.querySelector('#tbody').append(table_row);
});
});
}
