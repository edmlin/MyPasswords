import {
    TextView,
    Page,
    TextInput,
    Action,
    Stack,
    app,
    Button
} from 'tabris';

var http = require('http');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

const cred = {"installed": {"client_id":"553996293004-vpjgff5cun5qmtue1b14ovs4jk7hj1k0.apps.googleusercontent.com","project_id":"mypasswords-250012","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"NQ4CvPdJnC_s6x8VdtCaWhlQ","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost:8000/getcode"]}};
// Load client secrets from a local file.
// Authorize a client with credentials, then call the Google Drive API.
exports.GoogleAuth =
//(navigation) => navigation.append(authorize(cred));
(nv) => authorize(nv, cred);

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(nv, credentials) {
    const {auth_uri, client_id, redirect_uris} = credentials.installed;
    const authUrl = auth_uri + `?scope=${SCOPES[0]}&access_type=offline&response_type=code&client_id=${client_id}&redirect_uri=${redirect_uris[1]}`;
    console.log(authUrl);
    const page =
        <Page stretch>
            <Stack spacing={16} padding={16} stretchX>
                <TextView>
                    Please tap on this button
                </TextView>
                <Button centerX onSelect={() => app.launch(authUrl)}>Authenticate with Google</Button>
                <TextView>Then paste the code here</TextView>
                <TextInput id='code' stretchX/>
            </Stack>
        </Page>;
    nv.find(Action).detach();
    nv.append(page);
    var server = http.createServer((function(request,response)
    {
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("request = " + request);
    }));
    server.listen(8000);
}
