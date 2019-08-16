// tslint:disable: triple-equals

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

import {
  GoogleAuth
} from './SyncGoogle';

var passwords = {};
const passwordFile = fs.filesDir + '/MyPasswords.txt';

const addAction = <Action placement='default' title='Add' onSelect={() => openEditPage('')}/>;
const navigationView =
<NavigationView stretch drawerActionVisible>
</NavigationView>;
const listPage =
<Page title='My Passwords' onAppear={() => {navigationView.find(Action).detach(); addAction.appendTo(navigationView); }}>
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
  <Action title='Edit' onSelect={() => openEditPage(editPage.passwordId)}/>;
const saveAction =
  <Action title='Save' onSelect={() => savePassword(editPage)}/>;
const deleteAction =
  <Action title='Delete' onSelect={() => confirmDelete(editPage.passwordId, () => editPage.detach())}/>;

const editPage =
<Page id='editPasswordPage' autoDispose={false} background='#eee'>
  <ScrollView stretch>
    <Stack stretch alignment='stretchX' padding={0} spacing={1}>
        <Stack spacing={1} background='#fff' padding={8}>
          <TextView stretchX text="Name" textColor='#777' font='12px' background='#fff'/>
          <TextInput stretchX id='name' font='18px' borderColor='#fff'/>
        </Stack>
        <Stack spacing={1} background='#fff' padding={8}>
          <TextView stretchX text="URL" textColor='#777' font='12px' background='#fff'/>
          <TextInput stretchX keyboard='url' id='url'  font='18px' borderColor='#fff'/>
        </Stack>
        <Stack spacing={1} background='#fff' padding={8}>
          <TextView stretchX text="Account" textColor='#777' font='12px' background='#fff'/>
          <TextInput stretchX id='account'  font='18px' borderColor='#fff'/>
        </Stack>
        <Stack spacing={1} background='#fff' padding={8}>
          <TextView stretchX text="Password" textColor='#777' font='12px' background='#fff'/>
          <Composite stretchX>
            <TextInput left right='next() 8' type='password' id='password' font='18px' borderColor='#fff'/>
            <CheckBox text='Show' right centerY onCheckedChanged={showPasswordClicked}/>
          </Composite>
        </Stack>
        <Stack spacing={1} background='#fff' padding={8}>
          <TextView stretchX text="Note" textColor='#777' font='12px' background='#fff'/>
          <TextInput stretchX height={100} type='multiline' id='note' borderColor='#fff'/>
        </Stack>
        <Composite background='#fff' padding={8}>
          <TextView left centerY width={70} text="Modified: "/>
          <TextView left='prev() 16' right centerY id='timestamp'/>
        </Composite>
    </Stack>
  </ScrollView>
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
  <Stack padding={16} spacing={16}>
    <TextView text='Sync with Google Drive' onTap={() => GoogleAuth(navigationView)} font='20px'/>
    <TextView onTap={() => clearPasswords()} text='Delete all passwords' font='20px'/>
  </Stack>
);

async function clearPasswords()
{
  const dialog = <AlertDialog buttons={{ ok: "Confirm", cancel: "Cancel" }} title='Delete all passwords'>Are you sure to delete all passwords?</AlertDialog>;
  dialog.open();
  const {button} = await dialog.onClose.promise();
  if (button == 'ok')
  {
    passwords = {};
    fs.removeFile(passwordFile);
  }
  listPasswords();
}

function fillEditPage(passwordId)
{
  editPage.passwordId = passwordId;
  if (passwordId && passwords[passwordId])
  {
    const password = passwords[passwordId];
    editPage.find('#name').only().text = password.name;
    editPage.find('#url').only().text = password.url;
    editPage.find('#account').only().text = password.account;
    editPage.find('#password').only().text = password.password;
    editPage.find('#note').only().text = password.note;
    editPage.find('#timestamp').only().text = (new Date(password.timestamp)).toLocaleString();
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
  }
}

function openEditPage(passwordId)
{
  fillEditPage(passwordId);
  editPage.find(TextInput).set({editable: true});
  navigationView.find(Action).detach();
  navigationView.append(saveAction);
  if (passwordId && passwords[passwordId])
  {
    editPage.title = 'Edit Password';
    navigationView.append(
      <Action placement='navigation' title='Cancel' onSelect={() => openViewPage(passwordId)}/>
    );
    deleteAction.insertAfter(saveAction);
  }
  else
  {
    editPage.title = 'New Password';
  }
  editPage.find(TextInput).set({borderColor: '#ccc'});
  if (!editPage.parent())
  {
    navigationView.append(editPage);
  }
}

function openViewPage(passwordId)
{
  fillEditPage(passwordId);
  editPage.find(TextInput).set({editable: false});
  editPage.title = 'Password';
  navigationView.find(Action).detach();
  navigationView.append(editAction);
  editPage.find(TextInput).set({borderColor: '#fff'});
  if (!editPage.parent())
  {
    navigationView.append(editPage);
  }
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
  fs.readFile(passwordFile, 'utf-8')
    .then(value => { passwords = JSON.parse(value); listPasswords(); })
    .catch(error => console.error(error));
})();

function writePasswordFile()
{
  fs.writeFile(passwordFile, JSON.stringify(passwords), 'utf-8')
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
  var newPassword = false;
  if (passwordId == '' || passwordId == undefined)
  {
    passwordId = newID();
    newPassword = true;
  }
  passwords[passwordId] = password;

  console.log(passwords);
  writePasswordFile();
  listPasswords();
  if (newPassword)
  {
    editPage.detach();
  }
  else
  {
    openViewPage(passwordId);
  }
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
  for (const id in passwords)
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
  );
}
async function confirmDelete(passwordId, callback)
{
  const dialog =
  <AlertDialog buttons={{ok: 'Confirm', cancel: 'Cancel'}} title='Delete Password'>
  Confirm to delete password {passwords[passwordId].name + '/' + passwords[passwordId].account}?
  </AlertDialog>;
  dialog.open();
  const {button} = await dialog.onClose.promise();
  if (button == 'ok')
  {
      deletePassword(passwordId);
      if (callback != undefined)
      {
        callback();
      }
  }
}

function showPasswordClicked(event)
{
  event.target.siblings().last().revealPassword = event.value;
}
