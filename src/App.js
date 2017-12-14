import React, { Component } from 'react';
import './App.css';
import config from './config'


class FileInput extends Component {
  render() {
    return (
      <input type="file" placeholder="Search..." ref={(input) => this.pictureFileInput = input} onChange={() => this.props.onUserInput(this.pictureFileInput.files)} />
    );
  }
}

class QueryForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pictureFile: {}
    }

    this.handleUserInput = this.handleUserInput.bind(this);
    this.makeRequest = this.makeRequest.bind(this);
  }

  makeRequest(pictureFile) {
    if (!pictureFile || !('size' in pictureFile)) {
      return null;
    }

    fetchApi(pictureFile, 'ms').then(data => {
      if (data.err) {
        this.props.onPictureError(true);
      } else {
        this.props.onPictureError(false);
      }
      this.props.onResponse(data);
    });
  }

  handleUserInput(pictureFile) {
    this.setState({
      pictureFile: pictureFile[0],
    });

    this.props.onPictureChanged(pictureFile[0]);

  }

  render() {
    return (
      <form className="query-form" onSubmit={(e) => {
        e.preventDefault();
        this.makeRequest(this.state.pictureFile)
      }}>
        <FileInput pictureFile={this.state.pictureFile} onUserInput={this.handleUserInput} />
        <button type="submit" disabled={this.state.pictureFile ? !this.state.pictureFile.size : true}>Send</button>
      </form>
    )
  }
}

function ResultsSection(props) {
  if (!props.results.description) {
    return (
      <h1 className="picture-description">&nbsp;</h1>
    )
  }
  return (
    <h1 className="picture-description">
      {props.results.description.captions[0].text}
    </h1>
  );
}

function SelectedPicture(props) {
  const imageClassName = props.selectedPictureError ? 'err' : 'zzz';
  if (props.selectedPictureData) {
    return (
      <div className="picture-container">
        <img alt=" " src={props.selectedPictureData} className={imageClassName} />
      </div>
    )
  }
  return null;
}

class App extends Component {
  constructor() {
    super();

    this.state = {
      results: {},
      selectedPicture: {},
      selectedPictureError: false
    }

    this.handleResponse = this.handleResponse.bind(this);
    this.handlePictureChanged = this.handlePictureChanged.bind(this);
    this.handlePictureError = this.handlePictureError.bind(this);
  }

  handleResponse(response) {
    this.setState({
      results: response,
      selectedPictureData: this.state.selectedPictureData
    });
  }

  handlePictureError(val) {
    this.setState({
      selectedPictureError: val
    })
  }

  handlePictureChanged(pictureFile) {
    if (!pictureFile) {
      return null;
    }
    let reader = new FileReader();
    reader.readAsDataURL(pictureFile);
    reader.onload = (e) => {
      this.setState({
        results: '',
        selectedPictureData: e.srcElement.result,
        selectedPictureError: false
      });
    }
  }

  render() {
    return (
      <div className="App">
        <QueryForm onResponse={this.handleResponse} onPictureError={this.handlePictureError} onPictureChanged={this.handlePictureChanged} />
        <ResultsSection results={this.state.results} />
        <SelectedPicture selectedPictureData={this.state.selectedPictureData} selectedPictureError={this.state.selectedPictureError} />
      </div>
    )
  }
}



// Custom helpers

function fetchApi(data, provider) {

  const headers = new Headers({
    "Ocp-Apim-Subscription-Key": config.apiKey[provider],
    "Content-Type": "application/octet-stream"
  });

  return fetch(`${config.providerUrl[provider]}`, {
    method: "POST",
    body: data,
    headers: headers
  })
    .then(response => {
      if (!response.ok) {
        return setErr();
      }
      return response.json();
    })
    .catch(() => setErr());
}

function setErr() {
  return { err: true, description: { captions: [{ text: 'Hmmm something seems to be wrong... Maybe the file (at least 50*50px)? The Internet?' }] } }
}

export default App;
