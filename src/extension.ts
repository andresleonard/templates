import * as vscode from 'vscode';
import * as fs from 'fs';
import * as pathh from 'path';
import { performance } from 'perf_hooks';
import { HelloWorldPanel } from "./panels/HelloWorldPanel";

//webview toolkit
// import { provideVSCodeDesignSystem, vsCodeOption, vsCodeDropdown } from "@vscode/webview-ui-toolkit";
// provideVSCodeDesignSystem().register(vsCodeOption(), vsCodeDropdown());

const listOfTemplates : vscode.QuickPickItem[] = [
	{label: 'agenciasCeca'},
	{label: 'colombia'},
	{label: 'costaRica'},
	{label: 'dgsEspañol'},
	{label: 'dgs'},
	{label: 'guatemalaCorporativo'},
	{label: 'guatemala'},
	{label: 'hondurasCorporativo'},
	{label: 'honduras'},
	{label: 'jamaica'},
	{label: 'mexico'},
	{label: 'panamaAgencia'},
	{label: 'panama'},
	{label: 'peru'},
	{label: 'ecuador'},
	{label: 'salvadorCorporativo'},
	{label: 'salvador'},
];


function options( a : any){

	let option : String;

	a.forEach((element: { label: string; }) => {
		option += "<vscode-option>" + element.label + "</vscode-option>";
	});

	return option!;
}

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
	  console.log(err);
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
async function openFile( template : string, texto : string ){;

	const files = await vscode.workspace.findFiles(`**/${ template + texto + ".mjml"}`);
	const document = await vscode.workspace.openTextDocument(files[files.length - 1]);
	await vscode.window.showTextDocument(document);

	let startTime = performance.now();

	vscode.commands.executeCommand('mjml.previewToSide');

	var endTime = performance.now();

	console.log(`Tiempo tomado para ver las carpetas ${endTime - startTime} milisegundos`);

}


export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "decameron" is now active!');

	let testChannel = vscode.window.createOutputChannel("TestChannel");
	
	const disposable = vscode.commands.registerCommand('decameron.plantillas', async () => {
		
		let dest : string;
		const path = vscode.workspace.workspaceFolders![0].uri.path;

		let startTime = performance.now();

		let foldersCurrtentWorkspace : vscode.QuickPickItem[] = listOfFolders(path.substring(1));

		var endTime = performance.now();

		console.log(`Tiempo tomado para ver las carpetas ${endTime - startTime} milisegundos`);

		let test : String = `<label for="">Seleccionar carpeta</label>
		<select name="" id="folder">
			<option value="opcion1">opcion1</option>
		</select>`;

		// webviewtest

		// function getWebviewContent() {
		// 	return `<!DOCTYPE html>
		// 	<html lang="en">
		// 	<head>
		// 		<meta charset="UTF-8">
		// 		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		// 		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		// 		<title>Document</title>
		// 	</head>
		// 	<style>
		// 		form{
		// 			display: flex;
		// 			flex-direction: column;
		// 		}
		// 	</style>
		// 	<body>
		// 		<p>${path}</p>
		// 		<h1>Crear Plantilla decameron</h1>
		// 		<form action="">
		// 			<label for="">Seleccionar carpeta</label>
		// 			<select id="my-dropdown">
		// 				${options(foldersCurrtentWorkspace)}
		// 			</select>
		// 			<label for="">Seleccionar plantilla</label>
		// 			<select name="" id="">
		// 				${options(listOfTemplates)}
		// 			</select>
		// 			<label for="">Día de la plantilla</label>
		// 			<input type="number" name="" id="">
		// 			<label for="">Link del primera imagen</label>
		// 			<input type="text" name="" id="">
		// 			<label for="">Terminos y condiciones</label>
		// 			<input type="text" name="" id="">
		// 			<button type="submit">Crear plantilla</button>
		// 		</form>
		// 		<script>
		// 			console.log('test');
		// 		</script>
		// 	</body>
		// 	</html>`;
		//   }

		// // Create and show panel
		// const panel = vscode.window.createWebviewPanel(
		// 	'catCoding',
		// 	'Cat Coding',
		// 	vscode.ViewColumn.Two,
		// 	{}
		//   );
	
		//   // And set its HTML content
		//   panel.webview.html = getWebviewContent();
		
		// webviewtest

		
		//escoger carpeta	
		const selectFolder = await vscode.window.showQuickPick(foldersCurrtentWorkspace, {placeHolder: 'Selecciona la capeta destino'});

		let template : any;
		let texto : any;

		//escoger plantilla
		if(selectFolder !== undefined){
			template = await vscode.window.showQuickPick(listOfTemplates,{placeHolder: 'Seleccione la plantilla'});
			if(template !== undefined){
				//poner numero del día		
					texto = await vscode.window.showInputBox({
						placeHolder: 'dia del mail',
						//prompt: 'agregar dia'
				});
			}
		} 

		

		if (selectFolder !== undefined && template !== undefined && texto !== undefined) {
			//validate if file current exits
			
			if (selectFolder!.label === 'sin carpeta destino') {
				dest = "/" + template!.label + texto + ".mjml";
			}else{
				dest = selectFolder!.label + "/" + template!.label + texto + ".mjml";
			}
			
			copyFile(vscode, context, testChannel, '/templates/' + template!.label + '.mjml', dest, function(err : any, res : any) {});

			openFile(template.label, texto);	
				
			// Display a message box to the user
			vscode.window.showInformationMessage(template!.label + " creado");
			
		}

	});

	
	const helloCommand = vscode.commands.registerCommand("decameron.form", () => {
		HelloWorldPanel.render(context.extensionUri);
	});

	context.subscriptions.push(disposable, helloCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
