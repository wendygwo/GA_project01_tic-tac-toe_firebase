var tttApp = angular.module('tttApp',['firebase']);

tttApp.controller('tttController', function($scope,$firebase){

	//Set up the board in firebase
	var ref=new Firebase('https://wendytictactoe.firebaseio.com/board');
	//Create AngularFire reference to data
	var sync = $firebase(ref);
	//download the data into an array
	$scope.board=sync.$asArray();

	//Set up the number of moves counter in Firebase
	var counterRef=new Firebase('https://wendytictactoe.firebaseio.com/counter');
	//Create AngularFire reference to data
	var counterSync = $firebase(counterRef);
	//download the data into an array
	$scope.counter=counterSync.$asArray();

	//Set up the array of x moves and o moves in Firebase 
	//x moves is the first record under playerMoves
	//0 moves is the second record under playerMoves
	var playerMovesRef = new Firebase('https://wendytictactoe.firebaseio.com/playerMoves');
	var playerMovesSync = $firebase(playerMovesRef);
	$scope.playerMoves = playerMovesSync.$asArray();

	//Will either create two playerMoves records if it doesn't exist in database
	//If records do exist in Firebase, will reinitialize them
	$scope.playerMoves.$loaded(function(){
		console.log('went into player moves. Length is:')
		console.log($scope.playerMoves.length);
		if ($scope.playerMoves.length==0){
			$scope.playerMoves.$add({moveRecord: ['-1']}); //initializing x move array with a number. Seem to have problems adding an empty array
			$scope.playerMoves.$add({moveRecord: ['-2']}); //initializing o move array with a number. Seem to have problems adding an empty array
		}
		else {
			$scope.playerMoves[0].moveRecord=['-1']; //resets x move array
			$scope.playerMoves[1].moveRecord=['-2']; //resets o move array
			$scope.playerMoves.$save(0); //saves/updates first record - x moves
			$scope.playerMoves.$save(1);//saves/updates second record - o moves

		}
	});
	
	//The code below only executes after $scope.board is downloaded
	//Will create board if it doesn't already exist.
	//Otherwise it'll reset all the values to blanks
	$scope.board.$loaded(function(){
		// console.log('Board length: ' + $scope.board.length);
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

	//The code below only executes after $scope.counter is downloaded
	//Will create counter if it doesn't already exist and initialize it to 0
	//Otherwise it'll reset the counter value to 0
	$scope.counter.$loaded(function(){
		// console.log('Counter length: ' +$scope.counter.length);
		if ($scope.counter.length==0){ 			//creates counter variable if it doesn't already exist
			$scope.counter.$add({numMoves: 0})
			// console.log('Went into if scope counter length = 0.');
		}else{ 									//updates counter variable if it already exists in database
			$scope.counter[0].numMoves=0;
			$scope.counter.$save(0); //saves first element in counter
		}
	});

	//** Setting local variables
	$scope.winningCombinations = [['1','2','3'],['4','5','6'],['7','8','9'],['1','4','7'],['2','5','8'],['3','6','9'],['1','5','9'],['3','5','7']];


	//logic for when a user makes a move
	$scope.makeMove=function(idx){
		// console.log('Square number clicked(index): '+idx)
		// console.log('Current move number = ' + $scope.counter[0].numMoves);
		// console.log('Value in current box clicked: '+$scope.board[idx].playerMove);
		//only allows move if board piece not already taken
		if (($scope.board[idx].playerMove !='x') && ($scope.board[idx].playerMove!='o')){
			// console.log('Allowing player to move because current board position is empty');
			if (($scope.counter[0].numMoves)%2 == 0){
				$scope.board[idx].playerMove='x'; //updating value in board
				$scope.board.$save($scope.board[idx]); //saving board

				// console.log('Player x move record array is: '+$scope.playerMoves[0].moveRecord);

				//saves the index of the x player's move to firebase
				$scope.playerMoves[0].moveRecord.push(((idx+1).toString()));
				$scope.playerMoves.$save(0);

			} else {
				$scope.board[idx].playerMove='o';
				$scope.board.$save($scope.board[idx]);

				// console.log('Player o move record array is: '+$scope.playerMoves[1].moveRecord);
				//saves the index of the x player's move to firebase
				$scope.playerMoves[1].moveRecord.push(((idx+1).toString()));
				$scope.playerMoves.$save(1);
			}

			//*****************************
			//*** WIN LOGIC STARTS HERE ***
			//*****************************
			//checks for a winner if the number of moves taken is great than 5.
			//The number is 4 in here because I started with the num moves =0 for the first player
			if ($scope.counter[0].numMoves >=4){ 						//check if x is winner
				console.log('Went into the search for a winner if statement.')
				if ($scope.counter[0].numMoves%2 == 0){
					console.log('went in to check if x is a winner');
					console.log('number of winning combinations to check agains: '+$scope.winningCombinations.length);
					console.log('Array of moves from player X: ' + $scope.playerMoves[0].moveRecord);
					//Checks win conditions against current player's moves up until now
					for (var i = 0; i<$scope.winningCombinations.length;i++){
						if(($scope.playerMoves[0].moveRecord.indexOf($scope.winningCombinations[i][0])!=-1)&&($scope.playerMoves[0].moveRecord.indexOf($scope.winningCombinations[i][1])!=-1)&&($scope.playerMoves[0].moveRecord.indexOf($scope.winningCombinations[i][2])!=-1)){
							console.log('x wins');
							$scope.someoneWon=true;
							$scope.winningPlayer='starfish';
						}

					}

				}else{													//check if o is winner
					console.log('went in to check if o is a winner');

				}

			}
			//*****************************
			//**** WIN LOGIC ENDS HERE ****
			//*****************************


			$scope.counter[0].numMoves++; //increments counter locally
			$scope.counter.$save(0); //saves/pushes updates to counter to firebase
			//console.log('Counter incremented in makeMove function. numMoves counter = ' + $scope.counter[0].numMoves);
		
		}//End section that allows move, only if current position not taken
	}


});