var tttApp = angular.module('tttApp',['firebase']);

tttApp.controller('tttController', function($scope,$firebase){

	// window.addEventListener('DOMContentLoaded', function(){
	// 	console.log('Page loaded');
	// });

	// window.addEventListener('beforeunload', function(){
	// 	console.log('are you sure?');
	// });

	//********************************************************
	//****************  START Firebase setup  ****************
	//********************************************************

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

	//Set up variable to hold true/false for if someone won, who won, and if it's a cat's game
	var someoneWonRef = new Firebase('https://wendytictactoe.firebaseio.com/someoneWon');
	var someoneWonSync = $firebase(someoneWonRef);
	$scope.someoneWon= someoneWonSync.$asArray();

	//********************************************************
	//****************   END Firebase setup   ****************
	//********************************************************

	//********************************************************
	//*************  START game initialization   *************
	//*************  for firebase variables      *************
	//********************************************************

	//Will either create or initialize the someoneWon flag
	$scope.someoneWon.$loaded(function(){
		// console.log('went into someoneWon initialization. Length is: ');
		// console.log($scope.someoneWon.length);
		if ($scope.someoneWon.length==0){
			$scope.someoneWon.$add({winnerFlag: false});
			$scope.someoneWon.$add({winningPlayer: ''});
			$scope.someoneWon.$add({catsGameFlag: false});
		} else{
			$scope.someoneWon[0].winnerFlag=false;
			$scope.someoneWon[1].winningPlayer='';
			$scope.someoneWon[2].catsGameFlag=false;
			$scope.someoneWon.$save(0);
			$scope.someoneWon.$save(1);
			$scope.someoneWon.$save(2);
		}

	});

	//Will either create playerMoves records if it doesn't exist in database
	//If records do exist in Firebase, will reinitialize them.
	//First element is x-moves, second element is o-moves, third element is whether the current player is player 1
	$scope.playerMoves.$loaded(function(){
		// console.log('went into player moves. Length is:');
		// console.log($scope.playerMoves.length);
		if ($scope.playerMoves.length==0){
			$scope.playerMoves.$add({moveRecord: ['-1']}); //initializing x move array with a number. Seem to have problems adding an empty array
			$scope.playerMoves.$add({moveRecord: ['-2']}); //initializing o move array with a number. Seem to have problems adding an empty array
			$scope.playerMoves.$add({player1Flag: false}); //player 1 flag.
		}
		else {
			$scope.playerMoves[0].moveRecord=['-1']; //resets x move array
			$scope.playerMoves[1].moveRecord=['-2']; //resets o move array
			$scope.playerMoves.$save(0); //saves/updates first record - x moves
			$scope.playerMoves.$save(1);//saves/updates second record - o moves


			$scope.playerMoves[2].player1Flag=true; //resets player 1 flag
			$scope.playerMoves.$save(2);
			$scope.playerMoves[2].player1Flag=false; //resets player 1 flag
			$scope.playerMoves.$save(2);//flags whether this person is player 1 or not
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
			for (var j = 0; j<9; j++){
				$scope.board[j].playerMove='';
				$scope.board.$save(j);
			}
		}
	});

	//The code below only executes after $scope.counter is downloaded
	//Will create counter if it doesn't already exist and initialize it to 0
	//Otherwise it'll reset the counter value to 0
	$scope.counter.$loaded(function(){
		// console.log('Counter length: ' +$scope.counter.length);
		if ($scope.counter.length==0){ 			//creates counter variable if it doesn't already exist
			$scope.counter.$add({numMoves: 0}); //Counters number of moves made
			$scope.counter.$add({xWins: 0});
			$scope.counter.$add({oWins: 0});
			$scope.counter.$add({totalGames: 0});
			$scope.counter.$add({catsGames: 0});
			// console.log('Went into if scope counter length = 0.');
		}else{ 									//updates counter variable if it already exists in database
			$scope.counter[0].numMoves=0;
			$scope.counter[1].xWins=0;
			$scope.counter[2].oWins=0;
			$scope.counter[3].totalGames=0;
			$scope.counter[4].catsGames=0;
			$scope.counter.$save(0); //saves first element in counter
			$scope.counter.$save(1); //saves number of x wins
			$scope.counter.$save(2); //saves number of o wins
			$scope.counter.$save(3); //saves number of total games played
			$scope.counter.$save(4); //saves number of total games played
		}
	});

	//********************************************************
	//*************   END game initialization    *************
	//*************   for firebase variables     *************
	//********************************************************

	//********************************************************
	//*************    START Setting local       *************
	//*************    variables                 *************
	//********************************************************
	$scope.winningCombinations = [['1','2','3'],['4','5','6'],['7','8','9'],['1','4','7'],['2','5','8'],['3','6','9'],['1','5','9'],['3','5','7']];
	$scope.xTurnFlag = true;
	$scope.oTurnFlag = false;

	//********************************************************
	//*************    END Setting local         *************
	//*************    variables                 *************
	//********************************************************

	//logic for when a user makes a move
	$scope.makeMove=function(idx){
		console.log('Square number clicked(index): '+idx)
		// console.log('Current move number = ' + $scope.counter[0].numMoves);
		// console.log('Value in current box clicked: '+$scope.board[idx].playerMove);

		//If turn number == 0 and it's the first game in the current session,
		//set player 1 flag to true, LOCALLY ONLY, to keep both players from moving separately
		if (($scope.counter[0].numMoves==0) && ($scope.counter[3].totalGames==0)){
			$scope.playerMoves[2].player1Flag=true; //only changing the variable locally. Not pushing back up to firebase because I want there to be different flags for player 1 and player 2
			console.log('Set player1Flag to true: ' + $scope.playerMoves[2].player1Flag);
		}

		//only allows move if board piece not already taken and if no one has won and it's not a cat's game
		if (($scope.board[idx].playerMove !='x') && ($scope.board[idx].playerMove!='o') &&(!$scope.someoneWon[0].winnerFlag)&&(!$scope.someoneWon[2].catsGameFlag)){
			// console.log('Allowing player to move because current board position is empty');
			if ((($scope.counter[0].numMoves)%2 == 0)&& ($scope.playerMoves[2].player1Flag)){
				$scope.board[idx].playerMove='x'; //updating value in board
				$scope.board.$save($scope.board[idx]); //saving board

				// console.log('Player x move record array is: '+$scope.playerMoves[0].moveRecord);

				//saves the index of the x player's move to firebase
				$scope.playerMoves[0].moveRecord.push(((idx+1).toString()));//add 1 to idx, because my win logic assumes squares start at 1 rather than 0. Changed to string so that i could use indexOf to search for winning combinations
				$scope.playerMoves.$save(0);

				//Run checkwinner function here
				if ($scope.counter[0].numMoves >=4){ 						//check if x is winner
					$scope.checkWinner();
				}

				$scope.counter[0].numMoves++; //increments counter locally
				$scope.counter.$save(0); //saves/pushes updates to counter to firebase
				console.log('Counter incremented in makeMove function. x move. numMoves counter = ' + $scope.counter[0].numMoves);

				//set these variables for the next turn, so that the turn can show up for o going next
				$scope.xTurnFlag = false;
				$scope.oTurnFlag = true;

			} else if((($scope.counter[0].numMoves)%2 == 1)&& (!$scope.playerMoves[2].player1Flag)){
				$scope.board[idx].playerMove='o';
				$scope.board.$save($scope.board[idx]);

				// console.log('Player o move record array is: '+$scope.playerMoves[1].moveRecord);
				//saves the index of the x player's move to firebase
				$scope.playerMoves[1].moveRecord.push(((idx+1).toString())); //add 1 to idx, because my win logic assumes squares start at 1 rather than 0. Changed to string so that i could use indexOf to search for winning combinations
				$scope.playerMoves.$save(1);

				//Run checkwinner function here
				if ($scope.counter[0].numMoves >=4){ 						//check if x is winner
					$scope.checkWinner();
				}
				$scope.counter[0].numMoves++; //increments counter locally
				$scope.counter.$save(0); //saves/pushes updates to counter to firebase
				console.log('Counter incremented in makeMove function. o move. numMoves counter = ' + $scope.counter[0].numMoves);

				//set these variables for the next turn, so that the turn can show up for o going next
				$scope.xTurnFlag = true;
				$scope.oTurnFlag = false;
			}

		}//End section that allows move, only if current position not taken
	};

	$scope.checkWinner=function(){
		//*****************************
		//*** WIN LOGIC STARTS HERE ***
		//*****************************
		//checks for a winner if the number of moves taken is great than 5.
		//The number is 4 in here because I started with the num moves =0 for the first player

			console.log('Went into the search for a winner if statement.');
			if ($scope.counter[0].numMoves%2 == 0){
				console.log('went in to check if x is a winner');

				console.log('Array of moves from player X: ' + $scope.playerMoves[0].moveRecord);
				//Checks win conditions against current player's moves up until now
				for (var i = 0; i<$scope.winningCombinations.length;i++){
					if(($scope.playerMoves[0].moveRecord.indexOf($scope.winningCombinations[i][0])!=-1)&&($scope.playerMoves[0].moveRecord.indexOf($scope.winningCombinations[i][1])!=-1)&&($scope.playerMoves[0].moveRecord.indexOf($scope.winningCombinations[i][2])!=-1)){
						console.log('x wins');

						//sets winner flag and winning player name to true and 'starfish' and saves to Firebase
						$scope.someoneWon[0].winnerFlag=true;
						$scope.someoneWon[1].winningPlayer='starfish';
						$scope.someoneWon.$save(0);
						$scope.someoneWon.$save(1);

						//Adds to number of x wins, and total number of games counter
						$scope.counter[1].xWins++;
						$scope.counter.$save(1);
						$scope.counter[3].totalGames++;
						$scope.counter.$save(3);
					}

				}

			}else{													//check if o is winner
				console.log('went in to check if o is a winner');

				console.log('Array of moves from player O: ' + $scope.playerMoves[1].moveRecord);
				//Checks win conditions against current player's moves up until now
				for (var q = 0; q<$scope.winningCombinations.length;q++){
					if(($scope.playerMoves[1].moveRecord.indexOf($scope.winningCombinations[q][0])!=-1)&&($scope.playerMoves[1].moveRecord.indexOf($scope.winningCombinations[q][1])!=-1)&&($scope.playerMoves[1].moveRecord.indexOf($scope.winningCombinations[q][2])!=-1)){
						console.log('o wins');
						// $scope.someoneWon=true;
						$scope.someoneWon[0].winnerFlag=true;
						// $scope.winningPlayer='shellfish';
						$scope.someoneWon[1].winningPlayer='shellfish';
						$scope.someoneWon.$save(0);
						$scope.someoneWon.$save(1);

						//Adds to number of o wins, and total number of games counter
						$scope.counter[2].oWins++;
						$scope.counter.$save(2);
						$scope.counter[3].totalGames++;
						$scope.counter.$save(3);
					}

				}

			}//End checking if x or 0 is a winner here

			//Start Cat's game logic here
			if (($scope.counter[0].numMoves==8)&&($scope.someoneWon[0].winnerFlag==false)){
				console.log('Cats game');
				$scope.someoneWon[2].catsGameFlag=true;
				$scope.someoneWon.$save(2);

				//Adds to number of cats games, and total number of games counter
				$scope.counter[4].catsGames++;
				$scope.counter.$save(4);
				$scope.counter[3].totalGames++;
				$scope.counter.$save(3);

			}

		//*****************************
		//**** WIN LOGIC ENDS HERE ****
		//*****************************

	};//End checkWinner function

	$scope.newGame=function(){
			$scope.someoneWon[0].winnerFlag=false;
			$scope.someoneWon[1].winningPlayer='';
			$scope.someoneWon[2].catsGameFlag=false;
			$scope.someoneWon.$save(0);
			$scope.someoneWon.$save(1);
			$scope.someoneWon.$save(2);

			$scope.playerMoves[0].moveRecord=['-1']; //resets x move array
			$scope.playerMoves[1].moveRecord=['-2']; //resets o move array
			$scope.playerMoves.$save(0); //saves/updates first record - x moves
			$scope.playerMoves.$save(1);//saves/updates second record - o moves

			for (var i = 0; i<9; i++){
				$scope.board[i].playerMove='';
				$scope.board.$save(i);
			}


			$scope.counter[0].numMoves=0;
			$scope.counter.$save(0);

			// $scope.playerMoves[2].player1Flag=true; //resets player 1 flag
			// $scope.playerMoves.$save(2);
			// $scope.playerMoves[2].player1Flag=false; //resets player 1 flag
			// $scope.playerMoves.$save(2);
	};//End new game

});