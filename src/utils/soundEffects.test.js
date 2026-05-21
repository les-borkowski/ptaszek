import { playSuccess, playError } from './soundEffects'

describe('soundEffects', () => {
  let mockOscillator
  let mockGainNode
  let mockAudioContext

  beforeEach(() => {
    mockOscillator = {
      type: '',
      frequency: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }

    mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }

    mockAudioContext = {
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode),
      destination: {},
      currentTime: 0,
    }

    vi.stubGlobal('AudioContext', vi.fn(function() { return mockAudioContext }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('playSuccess creates an oscillator, connects it, and starts it', () => {
    playSuccess()
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1)
    expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode)
    expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination)
    expect(mockOscillator.start).toHaveBeenCalled()
    expect(mockOscillator.stop).toHaveBeenCalled()
  })

  test('playError creates an oscillator, connects it, and starts it', () => {
    playError()
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1)
    expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode)
    expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination)
    expect(mockOscillator.start).toHaveBeenCalled()
    expect(mockOscillator.stop).toHaveBeenCalled()
  })

  test('playSuccess sets a higher final frequency than playError', () => {
    playSuccess()
    const successFinalFreq = mockOscillator.frequency.linearRampToValueAtTime.mock.calls[0][0]

    vi.clearAllMocks()
    mockAudioContext.createOscillator.mockReturnValue(mockOscillator)
    mockAudioContext.createGain.mockReturnValue(mockGainNode)

    playError()
    const errorFinalFreq = mockOscillator.frequency.linearRampToValueAtTime.mock.calls[0][0]

    expect(successFinalFreq).toBeGreaterThan(errorFinalFreq)
  })
})
