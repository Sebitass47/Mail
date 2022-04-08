document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
  document.querySelector("#send-mail").addEventListener('click', () => send_email());
  // By default, load the inbox
  load_mailbox('inbox');
  

  

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}
 
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';

  // Clean the content of view-email
  document.querySelector('#view-email').innerHTML = '';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get the mails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Show each mail
      emails.forEach(element => {

        const email = document.createElement('div');
        email.style.borderRadius = '10px';
        
        email.innerHTML = `<p id="mail"><b>${element.sender}</b>
        <br>  ${element.timestamp} <br>${element.subject} </p>`
        
        if (element.read === true) {
          email.style.backgroundColor = "#D8D8D8";
        }

        //enter the mail and change the read = true
        email.addEventListener('click', () => viewed(element.id));
        //make cursor change to pointer
        email.addEventListener('mouseover', () => {
          email.style.cursor = "pointer";
        });
        document.querySelector('#emails-view').append(email);

        button = document.createElement('button');
        button.setAttribute("class", "btn btn-sm btn-outline-primary");

        if (mailbox === "inbox") {
          button.setAttribute("id", "archive");
          button.innerHTML = "Archive";
          button.addEventListener('click', () => archived(element.id));
          button.addEventListener('click', () => setTimeout(load_mailbox("inbox"),3000));
          document.querySelector('#emails-view').append(button);
        }
        else if (mailbox === "archive"){
          button.setAttribute("id", "unarchive");
          button.innerHTML = "Unarchive";
          button.addEventListener('click', () => unarchived(element.id));
          button.addEventListener('click', () => load_mailbox("inbox"));
          document.querySelector('#emails-view').append(button);
        }
      
      })

  });
  
}  


function send_email(){

  const recipient = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipient,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  load_mailbox('sent');
}


function viewed(id){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'block';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      // ... do something else with email ...
      const content = document.createElement('div');
      content.innerHTML = `<p><b>From:</b> ${email.sender}</p>
      <p><b>To:</b> ${email.recipients}</p>
      <p><b>Subject:</b> ${email.subject}</p>
      <p><b>Timestamp:</b> ${email.timestamp}</p>
      <hr>
      <p>${email.body}</p>`
      button = document.createElement('button');
      button.setAttribute('id', "reply");
      button.setAttribute("class", "btn btn-sm btn-outline-primary");
      button.innerHTML = "Reply";
      button.addEventListener('click', () => reply(email.sender, email.subject, email.body, email.timestamp));
      document.querySelector('#view-email').append(content);
      document.querySelector('#view-email').append(button);
  });

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function archived(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      console.log("Puntero1")

});
 
}

function unarchived(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  
}

function reply(recipient, subject, body, timestamp){
   // Show compose view and hide other views
   document.querySelector('#emails-view').style.display = 'none';
   document.querySelector('#compose-view').style.display = 'block';
   document.querySelector('#view-email').style.display = 'none';
 
   // Clear out composition fields
   document.querySelector('#compose-recipients').value = recipient;
   if (subject.slice(0,3) === "Re:"){
     console.log("Aqui estamos")
    document.querySelector('#compose-subject').value = subject;
   }
   else{
    document.querySelector('#compose-subject').value = `Re: ${subject} `;
   }
   
   document.querySelector('#compose-body').value = `On ${timestamp} ${recipient} wrote: ${body}`;
}
