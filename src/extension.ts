import * as vscode from 'vscode';
import * as fs from 'fs';
import * as pathh from 'path';

const listOfTemplates : vscode.QuickPickItem[] = [
	{label: 'agencias ceca'},
	{label: 'guatemala'},
	{label: 'honduras'},
	{label: 'salvador'},
	{label: 'guatemala corporativo'},
	{label: 'honduras corporativo'},
	{label: 'salvador corporativo'},
	{label: 'colombia'},
	{label: 'costaRica'},
	{label: 'dgs'},
	{label: 'dgs español'},
	{label: 'ecuador'},
	{label: 'jamaica'},
	{label: 'mexico'},
	{label: 'panama'},
	{label: 'panama agencia'},
	{label: 'peru'},
];

//functions
//copy template
async function copyFile(
	vscode : any,
	context : any,
	outputChannel : any,
	sourcePath : String,
	destPath : String,
	callBack : Function
  ): Promise<void> {
	try {
	  const wsedit = new vscode.WorkspaceEdit();
	  const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
	  const data = await vscode.workspace.fs.readFile(
		vscode.Uri.file(context.asAbsolutePath(sourcePath))
	  );
	  const filePath = vscode.Uri.file(wsPath + destPath);
	  wsedit.createFile(filePath, { ignoreIfExists: true });
	  await vscode.workspace.fs.writeFile(filePath, data);
	  let isDone = await vscode.workspace.applyEdit(wsedit);
	  if(isDone) {
		outputChannel.appendLine(`File created successfully: ${destPath}`);
		callBack(null, true);
	  }
	} catch (err) {
	  outputChannel.appendLine(`ERROR: ${err}`);
	  callBack(err, false);
	}
  }


//get all folders
function getDirectories (path : string) {
	return fs.readdirSync(path as fs.PathLike)
	  .filter(file => fs.statSync(pathh.join(path, file)).isDirectory());
  }
  
function getAllDirectories(dirPath : string, arrayOfDirectories : Array<string>) {
const directories = getDirectories(dirPath);
arrayOfDirectories = arrayOfDirectories || [];

directories.forEach(directory => {
	const newDirPath = pathh.join(dirPath, directory);
	arrayOfDirectories.push(newDirPath);
	getAllDirectories(newDirPath, arrayOfDirectories);
});

return arrayOfDirectories;
}

function listOfFolders(path : string){
	//this functios delete de current path of every item
	let list : String[] = getAllDirectories(path, []);
	let newList : vscode.QuickPickItem[] = [];
	list.forEach((element) => {
		let e = element.replace(/\\/g, '/');
		newList.push( { label: e.replace(path, '') } );
	});

	newList.push({ label:'sin carpeta destino'});

	return newList;
}


export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "decameron" is now active!');

	let testChannel = vscode.window.createOutputChannel("TestChannel");

	let disposable = vscode.commands.registerCommand('decameron.plantillas', async () => {

		let dest : string;
		const path = vscode.workspace.workspaceFolders![0].uri.path;
		let foldersCurrtentWorkspace : vscode.QuickPickItem[] = listOfFolders(path.substring(1));
		
		//escoger carpeta	
		const selectFolder = await vscode.window.showQuickPick(foldersCurrtentWorkspace, {placeHolder: 'Selecciona la capeta destino'});

		//escoger plantilla
		const template = await vscode.window.showQuickPick(listOfTemplates,{placeHolder: 'Seleccione la plantilla'});

		//poner numero del día		
		const texto = await vscode.window.showInputBox({
				placeHolder: 'dia del mail',
				//prompt: 'agregar dia'
		});
		
		//validate if file current exits
		
		if (selectFolder!.label === 'sin carpeta destino') {
			dest = "/" + template!.label + texto + ".mjml";
		}else{
			dest = selectFolder!.label + "/" + template!.label + texto + ".mjml";
		}

		//ejecutar
		copyFile(vscode, context, testChannel, '/templates/' + template!.label + '.mjml', dest, function(err : any, res : any) {});

		//open file
		const files = await vscode.workspace.findFiles(`**/${template!.label + texto + ".mjml"}`);
		if (files.length > 0) {
			const document = await vscode.workspace.openTextDocument(files[files.length - 1]);
			await vscode.window.showTextDocument(document);
			vscode.commands.executeCommand('mjml.previewToSide');
		} else {
			vscode.window.showInformationMessage(`No se pudo abri el archivo "${template!.label + texto + ".mjml"}". (reportar error)`);
		}
			
		// Display a message box to the user
		vscode.window.showInformationMessage(template!.label + " creado");
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
