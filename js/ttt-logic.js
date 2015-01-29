var tttApp = angular.module('tttApp',['firebase']);

tttApp.controller('tttController', function($scope,$firebase){

	var ref=new Firebase('https://wendytictactoe.firebaseio.com/board');
	//Create AngularFire reference to data
	var sync = $firebase(ref);
	//download the data into an array
	$scope.board=sync.$asArray();

	var counterRef=new Firebase('https://wendytictactoe.firebaseio.com/counter');
	//Create AngularFire reference to data
	var counterSync = $firebase(counterRef);
	//download the data into an array
	$scope.counter=counterSync.$asArray();

	//initialize board to empty strings
	//$scope.board=['','','','','','','','',''] //old way of initializing the board
	
	//the stuff here only happens after $scope.board is downloaded
	//Will generate board if it doesn't already exist.
	//Otherwise it'll reset all the values to blanks
	$scope.board.$loaded(function(){
		console.log('Board length: ' + $scope.board.length);
		if ($scope.board.length==0){ //if board doesn't exist in current instance, generates it
			for (var i = 0; i<9; i++){
				$scope.board.$add({playerMove: ''});
			}
		} else{							//if board exists, clears out all x's
			for (var i = 0; i<9; i++){
				$scope.board[i].playerMove='';
				$scope.board.$save(i);
			}
		}
	});

	$scope.counter.$loaded(function(){
		console.log('Counter length: ' +$scope.counter.length);
		if ($scope.counter.length==0){ //creates counter variable if it doesn't already exist
			$scope.counter.$add({numMoves: 0})
			console.log('Went into if scope counter length = 0.');
		}else{ //updates counter variable if it already exists in database
			$scope.counter[0].numMoves=0;
			$scope.counter.$save(0); //saves first element in counter
		}

	});

	$scope.makeMove=function(idx){
		console.log('going into makeMove function: ');
		console.log('square clicked(index): '+idx)
		$scope.board[idx].playerMove='x';
		$scope.board.$save($scope.board[idx]);
		//console.log(' Current scope counter = ' + $scope.counter[0].numMoves);
		$scope.counter[0].numMoves++;
		$scope.counter.$save(0); //saves first element in counter
		console.log('Counter incremented in makeMove function. numMoves counter = ' + $scope.counter[0].numMoves);
	}


	// //Initialize turnNumber to 0
	// $scope.turnNumber = 0;
	// //Arrays to store x and o moves
	// $scope.xMoves=[];
	// $scope.oMoves=[];

	// //Function to put X or O into the squares
	// $scope.makeMove=function(idx){
	// 	if (($scope.board[idx]!='x') && ($scope.board[idx]!='o')){ //This lines checks to see if the board piece has already been taken
	// 		if ($scope.turnNumber%2==0){
	// 			$scope.board[idx]='x';
	// 			$scope.xMoves.push((idx+1).toString()); //pushes current piece position into an array. Adding 1 because index starts at zero. My win logic starts numbering the squares at 1
	// 			console.log($scope.xMoves);
	// 		} else {
	// 			$scope.board[idx]='o';
	// 			$scope.oMoves.push((idx+1).toString());//pushes current piece position into an array. Adding 1 because index starts at zero. My win logic starts numbering the squares at 1
	// 			console.log($scope.oMoves);
	// 		}
	// 		$scope.turnNumber++;
	// 	}
	// }
});