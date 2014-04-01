Bug Swatter is a chrome extension that makes sorting through duplicates on the PA Bug Tracker easier.  

For security reasons the server code is not available in the public repo.



Server Info
===========
When sending requests to the server always check to see if an error is returned, all errors returned follow this format:  
*error.id* - Identifier of error, usualy refers to a requested action failing  
*error.reason* - The reason the error was thrown  
*error.displayMessage* - A readable version of the error, use this to convey to the user the occurance of the error
  
  
  
**Error reference**  
*Errors below follow this format*  
- **error.id** - More info  
 - **error.reason** - More info  
   - error.displayMessage  
  
&nbsp;  

- **authFail** - Thrown when server side authorization has failed  
 - **noUsername** - No username sent in request  
   - Authorization failed, no username provided  
 - **noPassword** - No password sent in request  
   - Authorization failed, no password provided  
 - **userNotFound** - User not found in database  
   - Authorization failed, no user with given username  