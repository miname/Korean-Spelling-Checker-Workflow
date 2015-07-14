window.setTimeout(function () {
  // fix local links.
  var dontFollowLinks = document.querySelectorAll('a[href="#"], a[href="#link"]');
  [].forEach.call(dontFollowLinks, function (link) {
    link.removeAttribute('href');
  });

  // remove line breaks in help text.
  var helpText = document.querySelectorAll('.tdETNor');
  [].forEach.call(helpText, function (help) {
    help.innerHTML = help.innerHTML.replace('<br>', '');
  });

  var correctionWords = document.querySelectorAll('#divLeft1 font.ul');

  // fix malformed correction words
  var userInputElementsForCorrectionWord = document.querySelectorAll('#divCorrectionTableBox1st .tdErrWord a');
  var noOfWordsWeShouldBreakApart = userInputElementsForCorrectionWord.length - correctionWords.length;

  var targetElement, ID, counter = 0;
  while (noOfWordsWeShouldBreakApart > 0) {
    targetElement = document.querySelectorAll('#divLeft1 font.ul')[counter++];
    ID = targetElement.id.replace('ul_', '');
    checkWordBreakErrorsAndFixIt(targetElement, ID);
  }

  function checkWordBreakErrorsAndFixIt(target, ID) {
    var targetText = target.textContent.replace('\n', '');
    var ID_Number = parseInt(ID, 10);
    var userInputText = userInputElementsForCorrectionWord[ID_Number].textContent;
    if (targetText !== userInputText) {
      var HTMLToReplace = userInputText.concat(constructAndReturnWordBreakDelimiter(ID_Number));
      target.parentElement.innerHTML = target.parentElement.innerHTML.replace(userInputText, HTMLToReplace);
      --noOfWordsWeShouldBreakApart;
    }
  }

  function constructAndReturnWordBreakDelimiter(ID_Number) {
    var userInputElement = userInputElementsForCorrectionWord[ID_Number], userInputErrorColor;
    switch (window.getComputedStyle(userInputElement).getPropertyValue('color')) {
      case 'rgb(255, 0, 0)':
        userInputErrorColor = 'red';
        break;
      case 'rgb(0, 0, 255)':
        userInputErrorColor = 'blue';
        break;
      case 'rgb(0, 128, 0)':
        userInputErrorColor = 'green';
        break;
      case 'rgb(128, 128, 0)':
        userInputErrorColor = 'Olive';
        break;
      default:
        userInputErrorColor = '';
    }
    return '</font><font id="ul_' + (ID_Number + 1) + '" color="' + userInputErrorColor + '" class="ul" onclick="fShowHelp(\'' + (ID_Number + 1) + '\')">';
  }

  // if the content of user input needs scroll, display the progress bar.
  var scrollDiv = document.getElementById('divLeft1');
  var divHeight = scrollDiv.offsetHeight;
  var scrollHeight = scrollDiv.scrollHeight;

  if (scrollHeight > divHeight) {
    var progressBar, scrollPercent;
    var progress = document.createElement('progress');
    progress.setAttribute('id', 'progressBar');
    progress.setAttribute('value', 0);
    progress.setAttribute('max', 100);
    document.getElementById('tdResultLTitle1').appendChild(progress);
    progressBar = document.getElementById('progressBar');
    var updateProgress = function () {
      scrollPercent = (scrollDiv.scrollTop / (scrollHeight - divHeight)) * 100;
      progressBar.setAttribute('value', scrollPercent);
    };
    scrollDiv.addEventListener('scroll', updateProgress);
  }

  // prepare tooltips
  correctionWords = document.querySelectorAll('#divLeft1 font.ul');
  [].forEach.call(correctionWords, function (word) {
    var ID = word.id.replace('ul_', '');
    var wordCandidates = [];
    var wordCandidateElements = document.querySelector('#tdReplaceWord_' + ID).querySelectorAll('li:not(.liUserInputCandidate) a');
    [].forEach.call(wordCandidateElements, function (element) {
      wordCandidates.push(element.textContent);
    });
    word.dataset.kscWordCandidates = wordCandidates.join(';');
    word.tabIndex = 1; // make focusable using the tab key.
    word.addEventListener('mouseover', showCorrections, false);
    word.addEventListener('mouseout', hideTooltip, false);
    word.addEventListener('focus', showCorrections, false);
    word.addEventListener('blur', hideTooltip, false);
    word.addEventListener('click', swapWord, false);
    word.addEventListener('keydown', handleKeyDown, false);
  });

  function showCorrections(event) {
    event.target.onclick();
    [].forEach.call(correctionWords, function (word) {
      word.style.backgroundColor = 'inherit';
    });
    event.target.style.backgroundColor = '#ffdc00';
    showTooltip(event);
  }

  // fill the tooltip content and display it
  function showTooltip(event) {
    var wordGotAttention = event.target;
    var wordCandidates = wordGotAttention.dataset.kscWordCandidates.split(';');
    if (wordCandidates[0] !== '') {
      updateTooltip(wordCandidates);
      tooltip.style.bottom = wordGotAttention.offsetParent.offsetHeight + scrollDiv.scrollTop - wordGotAttention.offsetTop + 10 + 'px';
      tooltip.style.left = wordGotAttention.offsetLeft + 'px';
      tooltip.classList.add('is-shown');
    }
  }

  function updateTooltip(wordCandidates) {
    if (wordCandidates.length !== 0) {
      var firstCandidate = '&darr; ' + wordCandidates.shift();
      wordCandidates.unshift(firstCandidate);
      tooltip.innerHTML = wordCandidates.reverse().join('<br>');
      tooltip.innerHTML = tooltip.innerHTML.replace(/…/g, '⋯');
    } else {
      hideTooltip();
    }
  }

  function hideTooltip() {
    var tooltipClass = tooltip.classList;
    if (tooltipClass.contains('is-shown')) {
      tooltipClass.remove('is-shown');
    }
  }

  function swapWord(event) {
    var wordGotAttention = event.target;
    var wordGotAttentionText = wordGotAttention.innerText;
    var wordCandidates = wordGotAttention.dataset.kscWordCandidates.split(';');
    var correctWord = wordCandidates.shift();
    if (correctWord !== '' && correctWord !== '대치어 없음') {
      wordGotAttention.innerText = correctWord;
      wordGotAttention.dataset.kscWordCandidates = wordCandidates.join(';');
      wordGotAttention.classList.add('corrected');
      updateTooltip(wordCandidates);
      // correct duplicates of the wrong word at once
      [].forEach.call(correctionWords, function (word) {
        if (word.innerText === wordGotAttentionText && word !== event.target) {
          wordCandidates = word.dataset.kscWordCandidates.split(';');
          word.innerText = wordCandidates.shift();
          word.dataset.kscWordCandidates = wordCandidates.join(';');
          word.classList.add('corrected');
        }
      });
    } else {
      hideTooltip();
    }
  }

  function handleKeyDown(event) {
    if ((event.keycode === 13) || (event.keycode === 32) || (event.which === 13) || (event.which === 32)) { // enter or space
      event.target.click();
    }
  }

  // style the wrong words.
  var wrongWords = document.querySelectorAll('#divLeft1 font.ul');
  [].forEach.call(wrongWords, function (word) {
    word.style.borderBottomColor = word.getAttribute('color');
  });

  // inject tooltip span
  var tooltip = document.createElement('span');
  tooltip.id = 'tooltip';
  document.getElementById('tableResult').appendChild(tooltip);

  // select the proofread text to copy the content to clipboard before closing the window.
  var selectProofreadText = function () {
    window.getSelection().selectAllChildren(document.getElementById('tdCorrection1stBox'));
  };
  document.getElementById('tableTail').addEventListener('mouseover', selectProofreadText, false);

  var removeSelection = function () {
    window.getSelection().removeAllRanges();
  };
  document.getElementById('tdBody').addEventListener('mouseenter', removeSelection, false);

  // if new updates available, show the notice.
  if (document.getElementById('ksc').dataset.updateStatus == '404') {
    var kscUpdateDiv = document.createElement('div');
    var kscUpdateLink = document.createElement('a');
    var kscUpdateLinkContent = document.createTextNode('새로운 버전!');
    kscUpdateLink.href = 'http://appletree.or.kr/forum/viewtopic.php?pid=951#p951';
    kscUpdateLink.title = 'http://appletree.or.kr/safari-extensions/#ksc-workflow';
    kscUpdateLink.appendChild(kscUpdateLinkContent);
    kscUpdateDiv.appendChild(kscUpdateLink);
    kscUpdateDiv.id = 'newVersion';
    document.getElementById('tdHead').appendChild(kscUpdateDiv);
  }
}, 800);
