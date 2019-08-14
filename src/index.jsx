import {
  Composite,
  contentView,
  Button,
  PropertyChangedEvent,
  NavigationView,
  Stack,
  Page,
  ScrollView,
  TextInput,
  TextView,
  CheckBox,
  SearchAction,
  drawer,
  ImageView,
  CollectionView,
  fs,
  AlertDialog,
  Action
  } from 'tabris';

const addAction = <Action placement='default' title='Add' onSelect={() => openEditPage('')}/>;
const navigationView =
<NavigationView stretch drawerActionVisible>
</NavigationView>;
const listPage =
<Page title='My Passwords' onAppear={() => addAction.appendTo(navigationView)} onDisappear={() => addAction.detach()}>
<Stack stretch alignment='stretchX' padding={16} spacing={16}>
  <Composite>
    <TextView left text='Search:' centerY width={50}/>
    <TextInput left='prev() 16' right centerY />
  </Composite>
  <ScrollView stretch>
    <Stack id='passwordList' stretch alignment='stretchX' padding={[16, 0]} spacing={8}>
    </Stack>
  </ScrollView>
</Stack>
</Page>;

const editAction =
  <Action title='Edit' onSelect={() => {navigationView.pageAnimation = 'none'; viewPage.detach(); openEditPage(viewPage.passwordId); navigationView.pageAnimation = 'default';}}/>;
const saveAction =
  <Action title='Save' onSelect={() => savePassword(editPage)}/>;
const deleteAction =
  <Action title='Delete' onSelect={() => confirmDelete(editPage.passwordId, () => editPage.detach())}/>;

const editPage =
<Page id='editPasswordPage' autoDispose={false} onAppear={() => saveAction.appendTo(navigationView)} onDisappear={() => {saveAction.detach(); deleteAction.detach(); }}>
  <Stack stretch alignment='stretchX' padding={16} spacing={16}>
    <Composite>
      <TextView alignment='right' left centerY width={80} text="Name: "/>
      <TextInput left='prev() 16' right centerY id='name' />
    </Composite>
    <Composite>
      <TextView alignment='right' left centerY width={80} text="URL: "/>
      <TextInput left='prev() 16' right centerY keyboard='url' id='url' />
    </Composite>
    <Composite>
      <TextView alignment='right' left centerY width={80} text="Account: "/>
      <TextInput left='prev() 16' right centerY id='account' />
    </Composite>
    <Composite>
      <TextView alignment='right' left centerY width={80} text="Password: "/>
      <TextInput left='prev() 16' right='next() 16' centerY type='password' id='password' />
      <CheckBox text='Show' right centerY onCheckedChanged={showPasswordClicked}/>
    </Composite>
    <Composite>
      <TextView alignment='right' left width={80} text="Note: "/>
      <TextInput left='prev() 16' right height={100} type='multiline' id='note' />
    </Composite>
    <Composite>
      <TextView alignment='right' left centerY width={80} text="Modified: "/>
      <TextView left='prev() 16' right centerY id='timestamp'/>
    </Composite>
  </Stack>
  </Page>;

const viewPage =
<Page id='viewPasswordPage' title='Password' autoDispose={false} onAppear={() => editAction.appendTo(navigationView)} onDisappear={() => editAction.detach()}>
  <Stack stretch alignment='stretchX' padding={16} spacing={16}>
    <Composite>
      <TextView alignment='right' left centerY width={80} text="Name: "/>
      <TextView left='prev() 16' right centerY id='name' />
    </Composite>
    <Composite>
      <TextView alignment='right' left centerY width={80} text="URL: "/>
      <TextView left='prev() 16' right centerY id='url' />
    </Composite>
    <Composite>
      <TextView alignment='right' left centerY width={80} text="Account: "/>
      <TextView left='prev() 16' right centerY id='account' />
    </Composite>
    <Composite>
      <TextView alignment='right' left centerY width={80} text="Password: "/>
      <TextInput editable={false} left='prev() 16' right='next() 16' centerY type='password' id='password' />
      <CheckBox text='Show' right centerY onCheckedChanged={showPasswordClicked}/>
    </Composite>
    <Composite>
      <TextView alignment='right' left width={80} text="Note: "/>
      <TextInput editable={false} left='prev() 16' right height={100} type='multiline' id='note' />
    </Composite>
    <Composite>
      <TextView alignment='right' left centerY width={80} text="Modified: "/>
      <TextView left='prev() 16' right centerY id='timestamp'/>
    </Composite>
  </Stack>
  </Page>;

contentView.append(navigationView.append(listPage));
drawer.enabled = true;
drawer.append(
  <$>
    <TextView>Sync with Google Drive</TextView>
  </$>
);
var passwords = {};
const passwordFile = fs.filesDir + '/MyPasswords.txt';

function openEditPage(passwordId)
{
  navigationView.append(editPage);
  editPage.passwordId = passwordId;
  if( (passwordId != '') && (passwords[passwordId] != undefined) )
  {
    const password = passwords[passwordId];
    editPage.find('#name').only().text = password.name;
    editPage.find('#url').only().text = password.url;
    editPage.find('#account').only().text = password.account;
    editPage.find('#password').only().text = password.password;
    editPage.find('#note').only().text = password.note;
    editPage.find('#timestamp').only().text = (new Date(password.timestamp)).toLocaleString();
    editPage.title = 'Edit Password';
    deleteAction.insertAfter(saveAction);
  }
  else
  {
    editPage.title = 'New Password';
    editPage.find('#name').only().text = '';
    editPage.find('#url').only().text = '';
    editPage.find('#account').only().text = '';
    editPage.find('#password').only().text = '';
    editPage.find('#note').only().text = '';
    editPage.find('#timestamp').only().text = '';
    editPage.title = 'New Password';
    editPage.find('#delete').dispose();
  }
}

function openViewPage(passwordId)
{
  
  navigationView.append(viewPage);
  viewPage.passwordId = passwordId;
  if( (passwordId != '') && (passwords[passwordId] != undefined) )
  {
    const password = passwords[passwordId];
    viewPage.find('#name').only().text = password.name;
    viewPage.find('#url').only().text = password.url;
    viewPage.find('#account').only().text = password.account;
    viewPage.find('#password').only().text = password.password;
    viewPage.find('#note').only().text = password.note;
    viewPage.find('#timestamp').only().text = (new Date(password.timestamp)).toLocaleString();
  }
  
  //openEditPage(passwordId);
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function newID()
{
  return uuidv4();
}

(function readPasswordFile()
{
  fs.readFile(passwordFile,'utf-8')
    .then(value => { passwords = JSON.parse(value); listPasswords(); })
    .catch(error => console.error(error));
})();

function writePasswordFile()
{
  fs.writeFile(passwordFile,JSON.stringify(passwords),'utf-8')
    .then(() => console.log("File written successfully."))
    .catch(error => console.error(error));
}

function savePassword(page)
{
  const password = {
    name: page.find('#name').only().text,
    url: page.find('#url').only().text,
    account: page.find('#account').only().text,
    password: page.find('#password').only().text,
    note: page.find('#note').only().text,
    timestamp: Date.now()
  };
  if (password.name == undefined || password.name.trim() == '')
  {
    const dialog =
    <AlertDialog buttons={{ok: 'OK'}} title='Save Password'>
    Please enter a name.
    </AlertDialog>;
    dialog.open();
    return;
  }
  var passwordId = page.passwordId;
  if(passwordId == '' || passwordId == undefined)
  {
    passwordId = newID();
  }
  passwords[passwordId] = password;

  console.log(passwords);
  writePasswordFile();

  listPasswords();
  editPage.detach();
}

function deletePassword(id)
{
  delete passwords[id];
  writePasswordFile();
  listPasswords();
}

function listPasswords()
{
  $('#passwordList').children().dispose();
  for(var id in passwords)
  {
    $('#passwordList').only().append(passwordLink(id));
  }
}

function passwordLink(passwordId)
{
  return(
    <Composite stretchX>
      <Button class='password' left right='next() 2' onSelect={() => openViewPage(passwordId)}>
        {passwords[passwordId].name}/{passwords[passwordId].account}
      </Button>
      <Button width={40} right onSelect={() => confirmDelete(passwordId)}>X</Button>
    </Composite>
  )
}

async function confirmDelete(passwordId, callback)
{
  const dialog =
  <AlertDialog buttons={{ok: 'Confirm', cancel: 'Cancel'}} title='Delete Password'>
  Confirm to delete password {passwords[passwordId].name + '/' + passwords[passwordId].account}?
  </AlertDialog>;
  dialog.open();
  const {button} = await dialog.onClose.promise();
  if(button == 'ok')
  {
      deletePassword(passwordId);
      if(callback != undefined)
      {
        callback();
      }
  }
}

function showPasswordClicked(event) 
{
  event.target.siblings().last().revealPassword = event.value;
}